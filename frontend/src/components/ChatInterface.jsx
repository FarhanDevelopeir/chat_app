'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import ReplyPreview from './ReplyPreview';
import MessageInput from './MessageInput';
import EmptyState from './EmptyState';
import DialogContainer from './DialogContainer';
import { scrollToMessage } from './utils/ChatInterface_functions';
import { SearchBar } from './SearchBar';

export default function ChatInterface({
  isAdmin = false,
  selectedUser = null,
  selectedGroup = null,
  admin = null,
  users = null,
  groups = [],
  onBackClick = null,
  chatType = 'user',
}) {
  const {
    socket,
    connected,
    messages,
    loading,
    typing,
    error,
    adminOnline,
    replyingTo,
    setReplyingTo,
    showEmojiPicker,
    setShowEmojiPicker,
    showDropdown,
    setShowDropdown,
    dialogOpen,
    setDialogOpen,
    userToEdit,
    setUserToEdit,
    isEditMode,
    setIsEditMode,
    newUsername,
    setNewUsername,
    newPassword,
    setNewPassword,
    createGroupOpen,
    setCreateGroupOpen,
    isGroupEditMode,
    setIsGroupEditMode,
    groupToEdit,
    setGroupToEdit,
    typingTimeout,
    sendMessage,
    sendFileMessage,
    sendVoiceMessage,
    handleTyping,
    handleStopTyping,
    handleEmojiReaction,
    handleDeleteMessage,
    clearMessages,
    setupSocketListeners,

    hasMoreMessages,
    loadingMoreMessages,
    loadMoreMessages,
    currentPage,
    setMessages
  } = useSocket();

  const messageInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
  const receiver = chatType === 'group' ? selectedGroup : (isAdmin ? selectedUser?.username : 'admin');
  const isGroupChat = chatType === 'group';

  const [pinnedMessage, setPinnedMessage] = useState(null);

  // Add these state variables after existing useState declarations
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);



  // Add these functions before the return statement
  const handleToggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      // Reset search when closing
      setSearchQuery('');
      setSearchResults([]);
      setCurrentResultIndex(0);
      setHighlightedMessageId(null);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(0);
      setHighlightedMessageId(null);
      return;
    }

    const results = messages.filter(message =>
      message.content &&
      message.content.toLowerCase().includes(query.toLowerCase()) &&
      !message.isDeleted
    );

    setSearchResults(results);
    setCurrentResultIndex(0);

    if (results.length > 0) {
      setHighlightedMessageId(results[0]._id);
      scrollToMessage(results[0]._id);
    } else {
      setHighlightedMessageId(null);
    }
  };

  const handleNavigateSearchResult = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentResultIndex < searchResults.length - 1 ? currentResultIndex + 1 : 0;
    } else {
      newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : searchResults.length - 1;
    }

    setCurrentResultIndex(newIndex);
    const targetMessage = searchResults[newIndex];
    setHighlightedMessageId(targetMessage._id);
    scrollToMessage(targetMessage._id);
  };



  // Add these handler functions
  const handlePinMessage = (messageId) => {
    const messageToPin = messages.find(msg => msg._id === messageId);
    if (!messageToPin) return;

    if (isGroupChat) {
      socket.emit('group:pinMessage', {
        messageId,
        groupId: selectedGroup,
        pinnedBy: username
      });
    } else {
      socket.emit('message:pin', {
        messageId,
        sender: username,
        receiver: isAdmin ? selectedUser?.username : 'admin',
        pinnedBy: username
      });
    }
  };

  const handleUnpinMessage = (messageId) => {
    if (isGroupChat) {
      socket.emit('group:unpinMessage', {
        messageId,
        groupId: selectedGroup,
        unpinnedBy: username
      });
    } else {
      socket.emit('message:unpin', {
        messageId,
        sender: username,
        receiver: isAdmin ? selectedUser?.username : 'admin',
        unpinnedBy: username
      });
    }
  };

  // Add these socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Pin message handlers
    const handleMessagePinned = (data) => {
      const { message } = data;
      setPinnedMessage(message);

      // Update the message in the messages array
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === message._id
            ? { ...msg, isPinned: true, pinnedBy: message.pinnedBy }
            : msg
        )
      );
    };

    const handleMessageUnpinned = (data) => {
      const { messageId } = data;
      setPinnedMessage(null);

      // Update the message in the messages array
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId
            ? { ...msg, isPinned: false, pinnedBy: null }
            : msg
        )
      );
    };

    // Register event listeners
    socket.on('message:pinned', handleMessagePinned);
    socket.on('message:unpinned', handleMessageUnpinned);
    socket.on('group:messagePinned', handleMessagePinned);
    socket.on('group:messageUnpinned', handleMessageUnpinned);

    return () => {
      socket.off('message:pinned', handleMessagePinned);
      socket.off('message:unpinned', handleMessageUnpinned);
      socket.off('group:messagePinned', handleMessagePinned);
      socket.off('group:messageUnpinned', handleMessageUnpinned);
    };
  }, [socket]);


  // Also update the loadPinnedMessage function to handle the reset properly
  const loadPinnedMessage = () => {
    // Reset first
    setPinnedMessage(null);

    if (isGroupChat && selectedGroup) {
      socket.emit('group:getPinnedMessage', { groupId: selectedGroup });
    } else if (!isGroupChat && (selectedUser || !isAdmin)) {
      socket.emit('message:getPinnedMessage', {
        sender: username,
        receiver: isAdmin ? selectedUser?.username : 'admin'
      });
    }
  };


  // Call loadPinnedMessage when chat opens
  useEffect(() => {
    if (socket && (selectedGroup || selectedUser || !isAdmin)) {
      loadPinnedMessage();
    }
  }, [selectedGroup, selectedUser, socket]);

  // Reset pinned message when switching chats
  useEffect(() => {
    setPinnedMessage(null);
  }, [selectedUser, selectedGroup, chatType]);


  // Focus input when loading completes
  useEffect(() => {
    if (!loading) {
      messageInputRef.current?.focus();
    }
  }, [loading, isAdmin, selectedUser, selectedGroup]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    const cleanup = setupSocketListeners(
      socket,
      username,
      isAdmin,
      selectedUser,
      selectedGroup,
      isGroupChat
    );

    return cleanup;
  }, [socket, username, isAdmin, selectedUser, selectedGroup, isGroupChat, setupSocketListeners]);

  // Handle chat selection changes
  useEffect(() => {
    if (socket && connected) {
      clearMessages();

      if (isGroupChat && selectedGroup) {
        socket.emit('group:join', selectedGroup);
      } else if (isAdmin && selectedUser?.username) {
        socket.emit('admin:selectUser', selectedUser?.username);
      } else {
        socket.emit('user:adminChat', username);
      }
    }
  }, [isAdmin, selectedUser, selectedGroup, socket, connected, isGroupChat, clearMessages]);


  // Updated handleLoadMore function to be added to ChatInterface
  const handleLoadMore = useCallback(() => {
    if (!socket || !connected) return;

    const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');

    if (isGroupChat && selectedGroup) {
      // For group chats
      socket.emit('messages:loadMore', {
        page: currentPage + 1,
        limit: 12,
        groupId: selectedGroup
      });
    } else if (isAdmin && selectedUser?.username) {
      // For admin selecting a user
      socket.emit('messages:loadMore', {
        page: currentPage + 1,
        limit: 12,
        sender: selectedUser.username,
        receiver: 'admin'
      });
    } else {
      // For regular user chatting with admin
      socket.emit('messages:loadMore', {
        page: currentPage + 1,
        limit: 12,
        sender: username,
        receiver: 'admin'
      });
    }
  }, [socket, connected, isAdmin, selectedUser, selectedGroup, isGroupChat, currentPage]);

  // Handle reply
  const handleReplyMessage = (replyToMessage) => {
    setReplyingTo(replyToMessage);
    messageInputRef.current?.focus();
  };

  // Handle typing
  const handleInputChange = (value) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    handleTyping({
      isGroupChat,
      selectedGroup,
      receiver,
      username
    });

    typingTimeout.current = setTimeout(() => {
      handleStopTyping({
        isGroupChat,
        selectedGroup,
        receiver,
        username
      });
    }, 2000);
  };

  const handleStopTypingAction = () => {
    handleStopTyping({
      isGroupChat,
      selectedGroup,
      receiver,
      username
    });
  };

  // Handle message submission
  const handleSubmit = (content) => {
    setReplyingTo(null);
    handleStopTypingAction();

    sendMessage({
      content,
      isGroupChat,
      selectedGroup,
      receiver,
      username,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  // Handle file upload
  const handleFileUpload = (fileData) => {
    sendFileMessage(fileData, {
      isGroupChat,
      selectedGroup,
      receiver,
      username,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
    });
  };

  // Handle voice upload
  const handleVoiceUpload = (voiceData) => {
    sendVoiceMessage(voiceData, {
      isGroupChat,
      selectedGroup,
      receiver,
      username,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
    });
  };

  // Handle emoji reaction
  const handleEmojiReactionAction = (messageId, emoji) => {
    handleEmojiReaction(messageId, emoji, username);
    setShowEmojiPicker(null);
  };

  // Handle message deletion
  const handleDeleteMessageAction = (messageId) => {
    handleDeleteMessage(messageId, username, isAdmin);
  };

  // Handle edit actions
  const handleEditUser = () => {
    const userToEdit = users.find(user => user.username === selectedUser?.username);
    setUserToEdit(userToEdit);
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleEditGroup = () => {
    const groupToEdit = groups.find(group => group._id === selectedGroup);
    setGroupToEdit(groupToEdit);
    setIsGroupEditMode(true);
    setCreateGroupOpen(true);
  };

  // Show empty state if admin with no selection
  if (isAdmin && !selectedUser && !selectedGroup) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        isAdmin={isAdmin}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        admin={admin}
        groups={groups}
        onBackClick={onBackClick}
        chatType={chatType}
        typing={typing}
        adminOnline={adminOnline}
        isMobile={isMobile}
        onEditUser={handleEditUser}
        onEditGroup={handleEditGroup}

        onToggleSearch={handleToggleSearch}
      />

      {/* // Add SearchBar component right after ChatHeader */}
      <SearchBar
        isVisible={searchVisible}
        onClose={handleToggleSearch}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        currentResultIndex={currentResultIndex}
        onNavigateResult={handleNavigateSearchResult}
      />

      <MessagesList
        messages={messages}
        loading={loading}
        username={username}
        isGroupChat={isGroupChat}
        isAdmin={isAdmin}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleDeleteMessage={handleDeleteMessageAction}
        handleReplyMessage={handleReplyMessage}
        handleEmojiReaction={handleEmojiReactionAction}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        isMobile={isMobile}
        setIsMobile={setIsMobile}
        // New props for pagination
        hasMoreMessages={hasMoreMessages}
        loadingMoreMessages={loadingMoreMessages}
        onLoadMore={handleLoadMore}
        // New pin-related props
        pinnedMessage={pinnedMessage}
        onPinMessage={handlePinMessage}
        onUnpinMessage={handleUnpinMessage}
        onScrollToPinnedMessage={scrollToMessage}
        // ... existing props
        searchQuery={searchQuery}
        highlightedMessageId={highlightedMessageId}
        searchResults={searchResults}
      />

      {error && (
        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 text-xs md:text-sm">
          {error}
        </div>
      )}

      <ReplyPreview
        replyingTo={replyingTo}
        onCancel={() => setReplyingTo(null)}
      />

      <MessageInput
        connected={connected}
        onSubmit={handleSubmit}
        onFileUpload={handleFileUpload}
        onVoiceUpload={handleVoiceUpload}
        onInputChange={handleInputChange}
        onStopTyping={handleStopTypingAction}
        messageInputRef={messageInputRef}
      />

      <DialogContainer
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        createGroupOpen={createGroupOpen}
        setCreateGroupOpen={setCreateGroupOpen}
        socket={socket}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        userToEdit={userToEdit}
        setUserToEdit={setUserToEdit}
        users={users}
        username={username}
        isGroupEditMode={isGroupEditMode}
        setIsGroupEditMode={setIsGroupEditMode}
        groupToEdit={groupToEdit}
        setGroupToEdit={setGroupToEdit}
      />
    </div>
  );
}