
'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Chat state management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isTabActive, setIsTabActive] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [isGroupEditMode, setIsGroupEditMode] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);

  // Add these new state variables to your SocketContext
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const MESSAGES_PER_PAGE = 12;


  // 
  const [latestMessages, setLatestMessages] = useState({});

  console.log('notificationPermission', notificationPermission)

  // Refs
  const typingTimeout = useRef(null);

  // Utility functions
  const removeDuplicateMessages = useCallback((messages) => {
    const uniqueMessages = [];
    const seen = new Set();

    for (const message of messages) {
      const identifier = `${message.content}-${message.sender}-${message.receiver}-${message.createdAt}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueMessages.push(message);
      }
    }
    return uniqueMessages;
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission;
      } catch (error) {
        console.log('Notification permission error:', error);
        return 'denied';
      }
    }
    return 'denied';
  }, []);



  const showToastNotification = useCallback((message, isAdmin) => {
    const senderName = isAdmin ? message.sender : 'Admin Support';
    let notificationBody = '';

    if (message.audio) {
      notificationBody = '🎵 Voice message';
    } else if (message.file) {
      notificationBody = message.file.type === 'image' ? '📷 Image' : '📎 File';
    } else {
      notificationBody = message.content;
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
    <div class="toast-header">
      <strong>${senderName}</strong>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="toast-body">${notificationBody}</div>
  `;

    // Add CSS styles
    toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 5000);

    // Click to focus window
    toast.onclick = () => {
      window.focus();
      toast.remove();
    };
  }, []);

  const showTabNotification = useCallback((message) => {
    const originalTitle = document.title;
    const senderName = message.sender;

    // Flash the title
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      document.title = flashCount % 2 === 0 ? `💬 New message from ${senderName}` : originalTitle;
      flashCount++;

      if (flashCount >= 10) { // Flash 5 times
        clearInterval(flashInterval);
        document.title = originalTitle;
      }
    }, 500);

    // Reset title when user focuses the tab
    const handleFocus = () => {
      document.title = originalTitle;
      clearInterval(flashInterval);
      window.removeEventListener('focus', handleFocus);
    };

    window.addEventListener('focus', handleFocus);
  }, []);

  const vibrateDevice = useCallback(() => {
    if ('vibrate' in navigator) {
      // Vibrate pattern: vibrate for 200ms, pause for 100ms, vibrate for 200ms
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const updateFaviconBadge = useCallback((count) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Draw red circle
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(24, 8, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw count text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 12);

    // Update favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  const showHybridNotification = useCallback((message, isAdmin) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // For mobile, use custom notifications
      showToastNotification(message, isAdmin);
      showTabNotification(message);
      vibrateDevice();

      // Update unread count
      const unreadCount = (parseInt(localStorage.getItem('unreadCount') || '0')) + 1;
      localStorage.setItem('unreadCount', unreadCount.toString());
      updateFaviconBadge(unreadCount);

    } else {
      // For desktop, try native notifications first
      if (notificationPermission === 'granted' || notificationPermission === 'default') {
        // Your existing notification code
        const senderName = isAdmin ? message.sender : 'Admin Support';
        let notificationBody = '';

        if (message.audio) {
          notificationBody = '🎵 Voice message';
        } else if (message.file) {
          notificationBody = message.file.type === 'image' ? '📷 Image' : '📎 File';
        } else {
          notificationBody = message.content;
        }

        const notification = new Notification(senderName, {
          body: notificationBody,
          icon: '/messenger.png',
          badge: '/verify.png',
          tag: `chat-${message.sender}`,
          requireInteraction: false,
          silent: false
        });

        setTimeout(() => notification.close(), 5000);
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } else {
        // Fallback to toast for desktop too
        showToastNotification(message, isAdmin);
      }
    }
  }, [notificationPermission, showToastNotification, showTabNotification, vibrateDevice, updateFaviconBadge]);

  // Socket event handlers
  const setupSocketListeners = useCallback((socketInstance, username, isAdmin, selectedUser, selectedGroup, isGroupChat) => {

    const handleMessagesHistory = (data) => {
      const { messages: messageHistory, hasMore, page } = data;
      const uniqueMessages = removeDuplicateMessages(messageHistory);

      if (page === 1) {
        // First load - replace all messages
        setMessages(uniqueMessages);
      } else {
        // Loading more messages - prepend to existing messages
        setMessages(prevMessages => {
          const combined = [...uniqueMessages, ...prevMessages];
          return removeDuplicateMessages(combined);
        });
      }

      setHasMoreMessages(hasMore);
      setCurrentPage(page);
      setLoading(false);
      setLoadingMoreMessages(false);

      // Mark messages as read
      const unreadMessages = uniqueMessages.filter(
        msg => !msg.isRead && (
          (isGroupChat && msg.groupId === selectedGroup) ||
          (!isGroupChat && msg.receiver === username)
        )
      );

      if (unreadMessages.length > 0) {
        unreadMessages.forEach(msg => {
          if (isGroupChat) {
            socketInstance.emit('group:markRead', {
              groupId: selectedGroup,
              userId: username
            });
          } else {
            socketInstance.emit('messages:markRead', {
              sender: msg.sender,
              receiver: msg.receiver
            });
          }
        });
      }
    };


    // Updated handleReceiveMessage function
    const handleReceiveMessage = (message) => {
      if (!message) return;

      setMessages(prevMessages => {
        // Safety check
        if (!prevMessages || !Array.isArray(prevMessages)) {
          return [message];
        }

        const messageExists = prevMessages.some(m =>
          (m._id && m._id === message._id) ||
          (m.content === message.content &&
            m.sender === message.sender &&
            ((isGroupChat && m.groupId === message.groupId) ||
              (!isGroupChat && m.receiver === message.receiver)) &&
            Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 5000)
        );

        if (messageExists) return prevMessages;

        // Filter based on chat type
        if (isGroupChat) {
          if (message.groupId !== selectedGroup) return prevMessages;
        } else {
          if (isAdmin && message.sender !== selectedUser?.username && message.receiver !== selectedUser?.username) {
            return prevMessages;
          }
        }

        const newMessages = [...prevMessages, message];
        return removeDuplicateMessages(newMessages);
      });

      // Update latest messages for display in chat list
      setLatestMessages(prev => {
        const chatId = message.groupId || (message.sender === 'admin' ? 'admin' : message.sender);
        return {
          ...prev,
          [chatId]: {
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt,
            isFile: !!message.file,
            isAudio: !!message.audio
          }
        };
      });

      // Show user side unread messages length
      if (message.sender !== username) {
        // For admin messages
        if (message.sender === 'admin') {
          socketInstance.emit('user:updateUnreadCount', {
            username,
            chatId: 'admin',
            increment: true
          });
        }
        // For group messages
        else if (message.groupId) {
          socketInstance.emit('user:updateUnreadCount', {
            username,
            chatId: message.groupId,
            increment: true
          });
        }
      }

      // Mark as read and play notification
      if (isGroupChat && message.groupId === selectedGroup) {
        socketInstance.emit('group:markRead', {
          groupId: selectedGroup,
          userId: username
        });
      } else if (!isGroupChat && message.receiver === username) {
        if (!isAdmin || (isAdmin && selectedUser?.username === message.sender)) {
          socketInstance.emit('messages:markRead', {
            sender: message.sender,
            receiver: message.receiver
          });
        }
      }

      // Play notification sound
      if (message.sender !== username) {
        showHybridNotification(message, isAdmin);
        try {
          const audio = new Audio('https://res.cloudinary.com/duqzgojyp/video/upload/v1737207753/tpnevoboszj1rnsdsto1.mp3');
          audio.play().catch(err => console.log('Audio play error:', err));
        } catch (error) {
          console.log('Notification sound error:', error);
        }
      }
    };

    const handleMessageSent = (message) => {
      setMessages(prevMessages => {
        const index = prevMessages.findIndex(m =>
        (m.content === message.content &&
          m.sender === message.sender &&
          ((isGroupChat && m.groupId === message.groupId) ||
            (!isGroupChat && m.receiver === message.receiver)) &&
          !m._id)
        );

        if (index !== -1) {
          const newMessages = [...prevMessages];
          newMessages[index] = message;
          return removeDuplicateMessages(newMessages);
        }

        const exists = prevMessages.some(m => m._id === message._id);
        if (exists) return prevMessages;

        return removeDuplicateMessages([...prevMessages, message]);
      });

      // Show user side unread messages length
      // Reset unread count when messages are loaded
      if (isGroupChat) {
        socketInstance.emit('user:updateUnreadCount', {
          username,
          chatId: selectedGroup,
          reset: true
        });
      } else {
        socketInstance.emit('user:updateUnreadCount', {
          username,
          chatId: 'admin',
          reset: true
        });
      }

    };

    const handleReadStatusUpdate = (updatedMessages) => {
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          const updatedMsg = updatedMessages.find(updated =>
            updated._id === msg._id ||
            (updated.content === msg.content &&
              updated.sender === msg.sender &&
              updated.receiver === msg.receiver &&
              Math.abs(new Date(updated.createdAt) - new Date(msg.createdAt)) < 5000)
          );

          if (updatedMsg) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      });
    };

    // const handleGroupReadStatusUpdate = (data) => {
    //   const { groupId, readBy, updatedMessages } = data;
    //   setMessages(prevMessages => {
    //     return prevMessages.map(msg => {
    //       const updatedMsg = updatedMessages.find(updated =>
    //         updated._id === msg._id ||
    //         (updated.content === msg.content &&
    //           updated.sender === msg.sender &&
    //           updated.groupId === msg.groupId &&
    //           Math.abs(new Date(updated.createdAt) - new Date(msg.createdAt)) < 5000)
    //       );

    //       if (updatedMsg) {
    //         return { ...msg, isRead: true };
    //       }
    //       return msg;
    //     });
    //   });
    // };

    // Updated handleGroupReadStatusUpdate function in SocketContext


    // Updated handleGroupReadStatusUpdate with safety checks
    const handleGroupReadStatusUpdate = (data) => {
      const { groupId, readBy, updatedMessages } = data;

      setMessages(prevMessages => {
        // Safety check for prevMessages
        if (!prevMessages || !Array.isArray(prevMessages)) {
          return [];
        }

        return prevMessages.map(msg => {
          // Safety check for updatedMessages
          if (updatedMessages && Array.isArray(updatedMessages)) {
            const updatedMsg = updatedMessages.find(updated =>
              (updated._id && msg._id && updated._id === msg._id) ||
              (updated.content === msg.content &&
                updated.sender === msg.sender &&
                updated.groupId === msg.groupId &&
                Math.abs(new Date(updated.createdAt) - new Date(msg.createdAt)) < 5000)
            );

            if (updatedMsg) {
              return { ...msg, isRead: true };
            }
          } else {
            // Fallback: mark messages as read based on groupId and readBy
            if (msg.groupId === groupId && msg.sender !== readBy) {
              return { ...msg, isRead: true };
            }
          }

          return msg;
        });
      });
    };

    const handleEmojiReactionUpdate = (data) => {
      const { messageId, reactions } = data;
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId
            ? { ...msg, reactions: reactions }
            : msg
        )
      );
    };

    const handleMessageDeleted = (data) => {
      const { messageId, deletedBy, isAdmin } = data;
      const deleteText = isAdmin
        ? "This message was deleted by admin"
        : `This message was deleted by ${deletedBy}`;

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId
            ? {
              ...msg,
              content: deleteText,
              isDeleted: true,
              deletedBy: deletedBy,
              file: undefined,
              audio: undefined
            }
            : msg
        )
      );
    };

    // Set up listeners
    socketInstance.on('messages:history', handleMessagesHistory);
    socketInstance.on('message:receive', handleReceiveMessage);
    socketInstance.on('message:sent', handleMessageSent);
    socketInstance.on('group:messageReceive', handleReceiveMessage);
    socketInstance.on('group:messageSent', handleMessageSent);
    socketInstance.on('messages:readStatusUpdate', handleReadStatusUpdate);
    socketInstance.on('group:readStatusUpdate', handleGroupReadStatusUpdate);
    socketInstance.on('message:emojiReactionUpdate', handleEmojiReactionUpdate);
    socketInstance.on('message:deleted', handleMessageDeleted);

    // Return cleanup function
    return () => {
      socketInstance.off('messages:history', handleMessagesHistory);
      socketInstance.off('message:receive', handleReceiveMessage);
      socketInstance.off('message:sent', handleMessageSent);
      socketInstance.off('group:messageReceive', handleReceiveMessage);
      socketInstance.off('group:messageSent', handleMessageSent);
      socketInstance.off('messages:readStatusUpdate', handleReadStatusUpdate);
      socketInstance.off('group:readStatusUpdate', handleGroupReadStatusUpdate);
      socketInstance.off('message:emojiReactionUpdate', handleEmojiReactionUpdate);
      socketInstance.off('message:deleted', handleMessageDeleted);
    };
  }, [removeDuplicateMessages]);


  // New function to load more messages
  const loadMoreMessages = useCallback(() => {
    if (!socket || !connected || loadingMoreMessages || !hasMoreMessages) return;

    setLoadingMoreMessages(true);
    const nextPage = currentPage + 1;

    // Get current chat context
    const username = localStorage.getItem('chat_username');
    const isAdmin = localStorage.getItem('chat_role') === 'admin';

    // You'll need to pass these parameters based on your current chat selection
    // This should be called from your ChatInterface component where you have access to selectedUser/selectedGroup
    socket.emit('messages:loadMore', {
      page: nextPage,
      limit: MESSAGES_PER_PAGE,
      // Add these based on current context:
      // For regular user-admin chat:
      // sender: username,
      // receiver: 'admin',
      // For admin selecting user:
      // sender: selectedUser?.username,
      // receiver: 'admin',
      // For group chat:
      // groupId: selectedGroup
    });
  }, [socket, connected, loadingMoreMessages, hasMoreMessages, currentPage]);

  // Chat actions
  const sendMessage = useCallback((messageData) => {
    if (!socket || !connected) return;

    const { content, isGroupChat, selectedGroup, receiver, username, replyTo } = messageData;

    const tempMessage = {
      content,
      sender: username,
      receiver: isGroupChat ? null : receiver,
      groupId: isGroupChat ? selectedGroup : null,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prevMessages => {
      const isDuplicate = prevMessages.some(m =>
        m.content === tempMessage.content &&
        m.sender === tempMessage.sender &&
        ((isGroupChat && m.groupId === tempMessage.groupId) ||
          (!isGroupChat && m.receiver === tempMessage.receiver)) &&
        Math.abs(new Date(m.createdAt) - new Date(tempMessage.createdAt)) < 5000
      );

      if (!isDuplicate) {
        return [...prevMessages, tempMessage];
      }
      return prevMessages;
    });

    if (isGroupChat) {
      socket.emit('group:sendMessage', {
        content,
        sender: username,
        groupId: selectedGroup,
        replyTo
      });
    } else {
      socket.emit('message:send', {
        content,
        sender: username,
        receiver,
        replyTo
      });
    }
  }, [socket, connected]);

  const sendFileMessage = useCallback((fileData, messageData) => {
    if (!socket || !connected) return;

    const { isGroupChat, selectedGroup, receiver, username, replyTo } = messageData;
    const fileDescription = fileData.type === 'image'
      ? `[Image: ${fileData.name}]`
      : `[Document: ${fileData.name}]`;

    const fileMessage = {
      content: fileDescription,
      sender: username,
      receiver: isGroupChat ? null : receiver,
      groupId: isGroupChat ? selectedGroup : null,
      createdAt: new Date().toISOString(),
      isRead: false,
      file: fileData
    };

    setMessages(prev => [...prev, fileMessage]);

    if (isGroupChat) {
      socket.emit('group:sendMessage', {
        content: fileDescription,
        sender: username,
        groupId: selectedGroup,
        file: fileData,
        replyTo
      });
    } else {
      socket.emit('message:send', {
        content: fileDescription,
        sender: username,
        receiver,
        file: fileData,
        replyTo
      });
    }
  }, [socket, connected]);

  const sendVoiceMessage = useCallback((voiceData, messageData) => {
    if (!socket || !connected) return;

    const { isGroupChat, selectedGroup, receiver, username, replyTo } = messageData;
    const voiceDescription = `[Voice: ${voiceData.name}]`;

    const voiceMessage = {
      content: voiceDescription,
      sender: username,
      receiver: isGroupChat ? null : receiver,
      groupId: isGroupChat ? selectedGroup : null,
      createdAt: new Date().toISOString(),
      isRead: false,
      audio: voiceData
    };

    setMessages(prev => [...prev, voiceMessage]);

    if (isGroupChat) {
      socket.emit('group:sendMessage', {
        content: voiceDescription,
        sender: username,
        groupId: selectedGroup,
        audio: voiceData,
        replyTo
      });
    } else {
      socket.emit('message:send', {
        content: voiceDescription,
        sender: username,
        receiver,
        audio: voiceData,
        replyTo
      });
    }
  }, [socket, connected]);

  const handleTyping = useCallback((data) => {
    const { isGroupChat, selectedGroup, receiver, username } = data;

    if (socket && connected) {
      if (isGroupChat) {
        socket.emit('group:typing', {
          groupId: selectedGroup,
          sender: username
        });
      } else {
        socket.emit('user:typing', {
          sender: username,
          receiver
        });
      }
    }
  }, [socket, connected]);

  const handleStopTyping = useCallback((data) => {
    const { isGroupChat, selectedGroup, receiver, username } = data;

    if (socket && connected) {
      if (isGroupChat) {
        socket.emit('group:stopTyping', {
          groupId: selectedGroup,
          sender: username
        });
      } else {
        socket.emit('user:stopTyping', {
          sender: username,
          receiver
        });
      }
    }
  }, [socket, connected]);

  const handleEmojiReaction = useCallback((messageId, emoji, username) => {
    if (!socket || !connected) return;

    socket.emit('message:addEmojiReaction', {
      messageId,
      emoji,
      username
    });
  }, [socket, connected]);

  const handleDeleteMessage = useCallback((messageId, username, isAdmin) => {
    if (!socket || !connected) return;

    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('message:delete', {
        messageId,
        deletedBy: username,
        isAdmin
      });
    }
  }, [socket, connected]);

  // const clearMessages = useCallback(() => {
  //   setMessages([]);
  //   setLoading(true);
  // }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLoading(true);
    setHasMoreMessages(true);
    setCurrentPage(1);
    setLoadingMoreMessages(false);
  }, []);

  const connect = useCallback(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      setReconnecting(false);

      const username = localStorage.getItem('chat_username');
      const deviceId = localStorage.getItem('chat_device_id');

      if (username && deviceId) {
        console.log('Attempting auto-login after reconnection');
        socketInstance.emit('user:islogin', { username, deviceId });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('reconnecting', () => {
      console.log('Socket reconnecting...');
      setReconnecting(true);
    });

    socketInstance.on('reconnect_failed', () => {
      console.log('Socket reconnection failed');
      setReconnecting(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  // Notification and tab visibility setup
  useEffect(() => {
    requestNotificationPermission();

    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    const handleFocus = () => setIsTabActive(true);
    const handleBlur = () => setIsTabActive(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [requestNotificationPermission]);



  // 3. Add this NEW useEffect after your existing ones:
useEffect(() => {
  if (socket) {
    // Listen for latest message updates
    socket.on('user:latestMessageUpdate', (messageUpdates) => {
      setLatestMessages(prev => ({
        ...prev,
        ...messageUpdates
      }));
    });

    // Request latest messages when component mounts
    // if (username) {
    //   socket.emit('user:getLatestMessages', { username });
    // }

      // socket.emit('user:getLatestMessages', { username });
   


    // Listen for initial latest messages
    socket.on('user:latestMessages', (messages) => {
      setLatestMessages(messages);
    });

    return () => {
      socket.off('user:latestMessageUpdate');
      socket.off('user:latestMessages');
    };
  }
}, [socket ]);

  // Helper function to format message for display
  const formatMessageForDisplay = (message) => {
    if (!message) return '';

    if (message.isFile) {
      return '📎 File';
    }

    if (message.isAudio) {
      return '🎵 Audio';
    }

    // Truncate long messages
    const maxLength = 35;
    if (message.content.length > maxLength) {
      return message.content.substring(0, maxLength) + '...';
    }

    return message.content;
  };

  const value = {
    // Socket
    socket,
    connected,
    reconnecting,

    // Chat state
    messages,
    setMessages,
    loading,
    setLoading,
    typing,
    setTyping,
    error,
    setError,
    adminOnline,
    setAdminOnline,
    replyingTo,
    setReplyingTo,
    showEmojiPicker,
    setShowEmojiPicker,
    showDropdown,
    setShowDropdown,
    notificationPermission,
    isTabActive,

    // Dialog states
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

    // Refs
    typingTimeout,

    // Actions
    sendMessage,
    sendFileMessage,
    sendVoiceMessage,
    handleTyping,
    handleStopTyping,
    handleEmojiReaction,
    handleDeleteMessage,
    clearMessages,
    setupSocketListeners,
    // showNotification,
    removeDuplicateMessages,


    hasMoreMessages,
    loadingMoreMessages,
    currentPage,
    loadMoreMessages,

    latestMessages,
    formatMessageForDisplay,

  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}