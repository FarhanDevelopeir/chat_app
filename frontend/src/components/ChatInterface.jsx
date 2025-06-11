'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import ReplyPreview from './ReplyPreview';
import MessageInput from './MessageInput';
import EmptyState from './EmptyState';
import DialogContainer from './DialogContainer';

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
    setupSocketListeners
  } = useSocket();

  const messageInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
  const receiver = chatType === 'group' ? selectedGroup : (isAdmin ? selectedUser?.username : 'admin');
  const isGroupChat = chatType === 'group';

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