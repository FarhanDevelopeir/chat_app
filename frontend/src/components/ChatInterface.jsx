'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import ReplyPreview from './ReplyPreview';
import MessageInput from './MessageInput';
import EmptyState from './EmptyState';
import DialogContainer from './DialogContainer';

export default function ChatInterface({
  isAdmin = false,
  isSubAdmin = false,
  selectedUser = null,
  selectedGroup = null,
  admin = null,
  subAdmin = null,
  users = null,
  groups = [],
  onBackClick = null,
  chatType = 'user',
  userType,
  currentUser

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
  } = useSocket();

  const messageInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const username = isAdmin ? 'admin' : isSubAdmin ? currentUser?.username : localStorage.getItem('chat_username');
  const receiver = chatType === 'group' ? selectedGroup : chatType === 'subadmin' ? selectedUser : (isAdmin || isSubAdmin ? selectedUser?.username : 'admin');

  const isGroupChat = chatType === 'group';

  console.log('selectedUser in chatInterface', selectedUser)

  // Focus input when loading completes
  useEffect(() => {
    if (!loading) {
      messageInputRef.current?.focus();
    }
  }, [loading, isAdmin, isSubAdmin, selectedUser, selectedGroup]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    const cleanup = setupSocketListeners(
      socket,
      username,
      isAdmin,
      isSubAdmin,
      selectedUser,
      selectedGroup,
      isGroupChat,
      chatType
    );

    return cleanup;
  }, [socket, username, isAdmin, isSubAdmin, selectedUser, selectedGroup, isGroupChat, chatType, setupSocketListeners]);

  // Handle chat selection changes
  useEffect(() => {
    if (socket && connected) {
      clearMessages();

      if (isGroupChat && selectedGroup) {
        socket.emit('group:join', selectedGroup);
      } else if (isAdmin && selectedUser?.username) {
        socket.emit('admin:selectUser', selectedUser?.username);
      } else if (isSubAdmin && selectedUser?.username) {
        socket.emit('subadmin:selectUser', { sender: currentUser?.username, receiver: selectedUser?.username });
      } else if (chatType === 'subadmin' && selectedUser) {
        socket.emit('user:subadminChat', {
          username: localStorage.getItem('chat_username'),
          subAdminUsername: selectedUser
        });
      } else {
        socket.emit('user:adminChat', username);
      }
    }
  }, [isAdmin, isSubAdmin, selectedUser, chatType, selectedGroup, socket, connected, isGroupChat, clearMessages]);


  // Updated handleLoadMore function to be added to ChatInterface
  const handleLoadMore = useCallback(() => {
    if (!socket || !connected) return;

    const username = isAdmin ? 'admin' : isSubAdmin ? currentUser?.username : localStorage.getItem('chat_username');

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
    } else if (isSubAdmin && selectedUser?.username) {
      // For admin selecting a user
      socket.emit('messages:loadMore', {
        page: currentPage + 1,
        limit: 12,
        sender: selectedUser.username,
        receiver: currentUser?.username
      });
    } else if (chatType === 'subadmin' && selectedUser) {
      // For regular user chatting with subAdmin - load more
      socket.emit('messages:loadMore', {
        page: currentPage + 1,
        limit: 12,
        sender: username,
        receiver: selectedUser,
        chatType: 'subadmin'
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
  }, [socket, connected, isAdmin, isSubAdmin, chatType, selectedUser, selectedGroup, isGroupChat, currentPage]);

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
  if ((isAdmin || isSubAdmin) && !selectedUser && !selectedGroup) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        isAdmin={isAdmin}
        isSubAdmin={isSubAdmin}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        admin={admin}
        subAdmin={subAdmin}
        groups={groups}
        onBackClick={onBackClick}
        chatType={chatType}
        typing={typing}
        adminOnline={adminOnline}
        isMobile={isMobile}
        onEditUser={handleEditUser}
        onEditGroup={handleEditGroup}
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