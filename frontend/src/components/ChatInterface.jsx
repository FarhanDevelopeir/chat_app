
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  CheckCheck,
  Check,
  Edit,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Users,
  Plus,
  X,
  Trash2,
  ChevronDown,
  Reply
} from 'lucide-react';
import FileMessage from './FileMessage';
import FileUpload from './FileUpload';
import VoiceRecorder from './VoiceRecorder';
import AudioMessage from './AudioMessage';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateUser from './CreateUser';
import CreateGroupDialog from './GroupDialogue'; // Import your CreateGroup component
import { scrollToMessage } from './utils/ChatInterface_functions';
// Add these new states at the top of your component



// Updated MessageBubble component with WhatsApp-style emoji reactions
const MessageBubble = ({
  message,
  isOwnMessage, isGroupChat = false,
  isAdmin,
  showEmojiPicker,
  setShowEmojiPicker,
  handleDeleteMessage,
  handleReplyMessage,
  handleEmojiReaction,
  scrollToMessage,
  username

}) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isFileMessage = message.file !== undefined;
  const isVoiceMessage = message.audio !== undefined;
  const [showDropdown, setShowDropdown] = useState(null);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2 relative`}>
      <div className={`relative ${message.replyTo ? '' : 'flex justify-between items-center'}   px-4  py-4 rounded-lg max-w-[80%] md:max-w-[70%] break-words group ${isOwnMessage
        ? 'bg-[#d9fdd3] text-gray-800'
        : 'bg-white text-gray-800'
        } ${message.isDeleted ? 'italic text-gray-500' : ''}`}>
        {/* 
        {message.replyTo && (
          <div className="bg-gray-50 border-l-4 border-blue-500 p-2 mb-2 rounded">
            <p className="text-xs text-blue-600 font-medium">{message.replyTo.sender}</p>
            <p className="text-sm text-gray-600 truncate">{message.replyTo.content}</p>
          </div>
        )}
        
        */}

        {message.replyTo && (
          <div
            onClick={() => scrollToMessage(message.replyTo.messageId)}
            className="bg-gray-50 border-l-4 border-blue-500 p-2 mb-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <p className="text-xs text-blue-600 font-medium">{message.replyTo.sender}</p>
            <p className="text-sm text-gray-600 truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Message content */}
        <div className="break-words">
        {/* Show sender name in group chat if not own message */}
        {isGroupChat && !isOwnMessage && (
          <p className="text-xs font-semibold text-[#00a884] mb-1">
            {message.sender}
          </p>
        )}

          {isVoiceMessage ? (
            <AudioMessage audioData={message.audio.data} />
          ) : isFileMessage ? (
            <FileMessage file={message.file} />
          ) : (
            <p className="mb-1 text-sm md:text-base">{message.content}</p>
          )}
        </div>

        {/* Message timestamp and read status */}
        <div className="flex items-center justify-end text-xs mx-2 text-gray-500 ">
          <span>{formattedTime}</span>
          {isOwnMessage && !message.isDeleted && (
            <span className="ml-1">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>

        {/* WhatsApp-style emoji reactions display */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="absolute -bottom-3 right-2 flex items-center bg-white rounded-full px-1 py-0.5 shadow-sm border">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleEmojiReaction(message._id, emoji)}
                className={`text-sm px-1 ${users.includes(username) ? 'scale-110' : ''
                  }`}
                title={`${users.join(', ')} reacted with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {Object.values(message.reactions).reduce((total, users) => total + users.length, 0)}
            </span>
          </div>
        )}

        {/* Emoji picker button - WhatsApp style */}
        {!message.isDeleted && (
          <button
            onClick={() => setShowEmojiPicker(showEmojiPicker === message._id ? null : message._id)}
            className={`absolute ${isOwnMessage
                ? '-bottom-2 -left-4'
                : '-bottom-2 -right-4'
              } opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50 rounded-full p-1 shadow-lg border border-gray-200 z-10`}
            title="Add reaction"
          >
            <span className="text-base text-gray-600">😊</span>
          </button>
        )}

        {/* Delete button for message owner or admin
        {!message.isDeleted && (isOwnMessage || isAdmin) && (
          <button
            onClick={() => handleDeleteMessage(message._id)}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
            title="Delete message"
          >
            <X className="h-3 w-3" />
          </button>
        )} */}
        {/* Message options dropdown for message owner or admin */}
        {!message.isDeleted && (
          <div className="">
            <button
              onClick={() => setShowDropdown(showDropdown === message._id ? null : message._id)}
              className={`absolute  top-4 right-2 opacity-0 group-hover:opacity-100 ${isOwnMessage ? 'group-hover:bg-[#d9fdd3]' : 'group-hover:bg-white'}   shadow-2xl rounded-full transition-opacity cursor-pointer text-black  hover:text-black`}
              title="Message options"
            >
              <ChevronDown className="h-6 w-6" />

            </button>

            {/* Dropdown menu */}
            <div className='relative'>
              {showDropdown === message._id && (
                <div className={`absolute top-0 ${isOwnMessage ? 'right-0' : ' left-0'}  z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[120px]`}>
                  <button
                    onClick={() => {
                      handleReplyMessage(message);
                      setShowDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteMessage(message._id);
                      setShowDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>


          </div>
        )}
      </div>

      {/* WhatsApp-style Emoji picker */}
      {showEmojiPicker === message._id && (
        <div className="absolute z-30 bg-gray-800 rounded-full px-3 py-2 shadow-lg"
          style={{
            bottom: '40px',
            left: isOwnMessage ? 'auto' : '10px',
            right: isOwnMessage ? '10px' : 'auto'
          }}>
          <div className="flex items-center gap-2">
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiReaction(message._id, emoji)}
                className="text-2xl hover:scale-125 transition-transform p-1"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
            {/* Add more emojis button */}
            {/* <button
              className="bg-gray-600 rounded-full p-1 text-white hover:bg-gray-500"
              title="More reactions"
            >
              <Plus className="h-4 w-4" />
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChatInterface({
  isAdmin = false,
  selectedUser = null,
  selectedGroup = null, // New prop for selected group
  users = null,
  groups = [], // New prop for groups list
  dialogOpen = null,
  setDialogOpen = null,
  setUserToEdit = null,
  // setGroupToEdit = null,
  setIsEditMode = null,
  // groupToEdit = null,
  userToEdit = null,
  isEditMode = null,
  // setIsGroupEditMode = null,
  // isGroupEditMode = null,
  newUsername = null,
  newPassword = null,
  setNewUsername = null,
  setNewPassword = null,
  onBackClick = null,
  chatType = 'user', // New prop: 'user' or 'group'
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeout = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false); // New state for create group dialog

  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isTabActive, setIsTabActive] = useState(true);

  const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
  const receiver = chatType === 'group' ? selectedGroup : (isAdmin ? selectedUser : 'admin');
  const isGroupChat = chatType === 'group';

  const [isGroupEditMode, setIsGroupEditMode] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);

  console.log('isGroupEditMode', isGroupEditMode)
  // console.log('chatType', chatType)
  // console.log('messages', messages)
  // Add these new states at the top of your component
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // Track which message's emoji picker is open
  const [replyingTo, setReplyingTo] = useState(null);





  // Add this function to handle reply
  const handleReplyMessage = (replyToMessage) => {
    setReplyingTo(replyToMessage);
    messageInputRef.current?.focus();
  };



  const requestNotificationPermission = async () => {
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
  }

  const showNotification = (message) => {
    console.log('message in notification', message)

    if (notificationPermission === 'granted' || notificationPermission === 'default') {
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

      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const removeDuplicateMessages = (messages) => {
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
  };

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
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      messageInputRef.current?.focus();
    }
  }, [loading, isAdmin, selectedUser, selectedGroup]);

  useEffect(() => {
    if (!socket) return;

    console.log('in main useEffect')

    // Handle receiving message history
      const handleMessagesHistory = (messageHistory) => {
          const uniqueMessages = removeDuplicateMessages(messageHistory);
        setMessages(uniqueMessages);
        setLoading(false);

        // Mark all unread messages as read
        const unreadMessages = uniqueMessages.filter(
          msg => !msg.isRead && (
          (isGroupChat && msg.groupId === selectedGroup) ||
          (!isGroupChat && msg.receiver === username)
        )
        );

        if (unreadMessages.length > 0) {
          unreadMessages.forEach(msg => {
          if (isGroupChat) {
            socket.emit('group:markRead', {
              groupId: selectedGroup,
              userId: username
            });
          } else {
              socket.emit('messages:markRead', {
                sender: msg.sender,
                receiver: msg.receiver
              });
          }
          });
        }
      };

    // Handle read status updates from server
    const handleReadStatusUpdate = (updatedMessages) => {
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          // Find if this message was updated
          const updatedMsg = updatedMessages.find(updated =>
            updated._id === msg._id ||
            (updated.content === msg.content &&
              updated.sender === msg.sender &&
              updated.receiver === msg.receiver &&
              Math.abs(new Date(updated.createdAt) - new Date(msg.createdAt)) < 5000)
          );

          // If found, update the read status
          if (updatedMsg) {
            return { ...msg, isRead: true };
          }

          return msg;
        });
      });
    };

    const handleReceiveMessage = (message) => {
      // for issue resolve
      setMessages(prevMessages => {
            // Check if message already exists
            const messageExists = prevMessages.some(m =>
              (m._id && m._id === message._id) ||
              (m.content === message.content &&
                m.sender === message.sender &&
                ((isGroupChat && m.groupId === message.groupId) ||
              (!isGroupChat && m.receiver === message.receiver)) &&
                Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 5000)
            );

        if (messageExists) return prevMessages;

        // Filter messages based on chat type
        if (isGroupChat) {
          // For group chat, only show messages from the selected group
          if (message.groupId !== selectedGroup) {
            return prevMessages;
          }
        } else {
          // For individual chat, filter as before
          if (isAdmin && message.sender !== selectedUser && message.receiver !== selectedUser) {
            return prevMessages;
          }
        }

        const newMessages = [...prevMessages, message];
        return removeDuplicateMessages(newMessages);
      });

          // Mark message as read
      if (isGroupChat && message.groupId === selectedGroup) {
        socket.emit('group:markRead', {
          groupId: selectedGroup,
          userId: username
        });
          } else if (!isGroupChat && message.receiver === username) {
            if (!isAdmin || (isAdmin && selectedUser === message.sender)) {
              socket.emit('messages:markRead', {
                sender: message.sender,
                receiver: message.receiver
              });
            }
          }

      // Play notification sound
      if (message.sender !== username) {
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
    };

    // Handle group message events
    const handleGroupMessageReceive = (message) => {
      handleReceiveMessage(message);
    };

    const handleGroupMessageSent = (message) => {
      handleMessageSent(message);
    };

    // Handle emoji reaction updates
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

    // Handle message deletion
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

    // Add new socket listeners
    socket.on('message:emojiReactionUpdate', handleEmojiReactionUpdate);
    socket.on('message:deleted', handleMessageDeleted);

    // close for now
    // Set up socket event listeners
    socket.on('messages:history', handleMessagesHistory);
    socket.on('message:receive', handleReceiveMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('group:messageReceive', handleGroupMessageReceive);
    socket.on('group:messageSent', handleGroupMessageSent);
    socket.on('messages:readStatusUpdate', handleReadStatusUpdate); // New listener


    // Cleanup
    return () => {
      socket.off('messages:history', handleMessagesHistory);
      socket.off('message:receive', handleReceiveMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('group:messageReceive', handleGroupMessageReceive);
      socket.off('group:messageSent', handleGroupMessageSent);
      socket.off('messages:readStatusUpdate', handleReadStatusUpdate); // New cleanup
      socket.off('message:emojiReactionUpdate', handleEmojiReactionUpdate);
      socket.off('message:deleted', handleMessageDeleted);

    };
  }, [socket, username, isAdmin, selectedUser, selectedGroup, receiver, isGroupChat]);


  // Function to handle emoji reaction
  const handleEmojiReaction = (messageId, emoji) => {
    if (!socket || !connected) return;

    socket.emit('message:addEmojiReaction', {
      messageId,
      emoji,
      username
    });

    setShowEmojiPicker(null); // Close emoji picker
  };

  // Function to handle message deletion
  const handleDeleteMessage = (messageId) => {
    if (!socket || !connected) return;

    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('message:delete', {
        messageId,
        deletedBy: username,
        isAdmin
      });
    }
  };



  // for realtime read status updates
  // Clear messages and reload when selected user/group changes
  useEffect(() => {
    if (socket && connected) {
      setLoading(true);
      setMessages([]);

      if (isGroupChat && selectedGroup) {
        socket.emit('group:join', selectedGroup);
      } else if (isAdmin && selectedUser) {
        socket.emit('admin:selectUser', selectedUser);
      } else {
        socket.emit('user:adminChat', username);
      }
    }
  }, [isAdmin, selectedUser, selectedGroup, socket, connected, isGroupChat]);

  const handleTyping = () => {
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
  };

  const handleStopTyping = () => {
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
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    handleTyping();

    typingTimeout.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setReplyingTo(null); // Clear replying state on send

    if (!newMessage.trim() || !socket || !connected) return;

    handleStopTyping();

    const tempMessage = {
      content: newMessage,
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

    // Send message via socket
    if (isGroupChat) {
      socket.emit('group:sendMessage', {
        content: newMessage,
        sender: username,
        groupId: selectedGroup
      });
    } else {
      socket.emit('message:send', {
        content: newMessage,
        sender: username,
        receiver,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
      });
    }

    setNewMessage('');
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  const handleFileUpload = (fileData) => {
    if (!socket || !connected) return;

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
        file: fileData
      });
    } else {
      socket.emit('message:send', {
        content: fileDescription,
        sender: username,
        receiver,
        file: fileData,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
      });
    }
  };

  const handleVoiceUpload = (voiceData) => {
    if (!socket || !connected) return;

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
        audio: voiceData
      });
    } else {
      socket.emit('message:send', {
        content: voiceDescription,
        sender: username,
        receiver,
        audio: voiceData,
      replyTo: replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender
      } : null
      });
    }
  };
  // close for now


  // If admin with no selected user or group
  if (isAdmin && !selectedUser && !selectedGroup) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f0f2f5]">
        <p className="text-gray-500">Select a user or group to start chatting</p>
      </div>
    );
  }

  const chatBgStyle = {
    backgroundImage: `url('/chat-bg.jpg')`,
    backgroundRepeat: 'repeat',
    backgroundColor: '#efeae2',
  };

  // Get current chat display name
  const getChatDisplayName = () => {
    if (isGroupChat) {
      const group = groups.find(g => g._id === selectedGroup);
      return group ? group.name : 'Group';
    }
    return isAdmin ? selectedUser : 'Admin Support';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile-optimized header component */}
      <div className="flex fixed w-full top-0 right-0 md:static md:w-auto items-center justify-between p-2.5 md:p-3 bg-[#008069] md:bg-[#f0f2f5] border-b border-gray-200 text-white md:text-black">
        <div className="flex items-center">
          {/* Back button for mobile */}
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="p-1 mr-2 text-white md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="relative">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium">
              {isGroupChat ? (
                <Users className="h-5 w-5" />
              ) : (
                isAdmin ? selectedUser?.charAt(0).toUpperCase() : 'A'
              )}
            </div>
            {!isAdmin && !isGroupChat && adminOnline && (
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-[#008069] md:border-white"></div>
            )}
          </div>

          <div className="ml-2 md:ml-3">
            <p className="text-xs md:text-sm font-medium text-white md:text-gray-900 flex items-center gap-1">
              {getChatDisplayName()}
              {!isAdmin && !isGroupChat && (
                <img
                  src="/blue-tick.png"
                  alt="Blue Tick"
                  className="w-3 h-3 md:w-5 md:h-5"
                />
              )}
            </p>
            {typing ? (
              <p className="text-xs text-gray-200 md:text-gray-500 animate-pulse">typing...</p>
            ) : (
              <p className="text-xs text-gray-200 md:text-gray-500">
                {isGroupChat && (
                  `${groups.find(g => g._id === selectedGroup)?.members?.length || 0} members`
                )}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Call buttons - Mobile only */}
          {/* <div className="md:hidden flex items-center">
            <button className="text-white p-1">
              <Video className="h-5 w-5" />
            </button>
            <button className="text-white p-1">
              <Phone className="h-5 w-5" />
            </button>
          </div> */}

          {/* Options menu */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white md:text-gray-800 p-1">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin && selectedUser && !isGroupChat && (
                <DropdownMenuItem onClick={() => {
                  const userToEdit = users.find(user => user.username === selectedUser);
                  setUserToEdit(userToEdit);
                  setIsEditMode(true);
                  setDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                Search Messages
              </DropdownMenuItem>
              <DropdownMenuItem>
                Clear Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* Edit button - only show for admin when a user is selected (desktop only) */}
          {isAdmin && selectedUser && !isGroupChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const userToEdit = users.find(user => user.username === selectedUser);
                console.log('userToEdit', userToEdit)
                setUserToEdit(userToEdit);
                setIsEditMode(true);
                setDialogOpen(true);
              }}
              className="hidden md:flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {isAdmin && selectedGroup && isGroupChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('selectedGroup', selectedGroup)
                console.log('groups', groups)
                const groupToEdit = groups.find(group => group._id === selectedGroup);
                console.log('groupToEdit', groupToEdit)
                setGroupToEdit(groupToEdit);
                // if (typeof setGroupToEdit === 'function') {
                //   setGroupToEdit(groupToEdit);
                // }
                // if (typeof setIsGroupEditMode === 'function') {
                //   setIsGroupEditMode(true);
                // }
                setIsGroupEditMode(true);
                setCreateGroupOpen(true);
              }}
              className="hidden md:flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Group
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-2 pt-4 mb-12  mt-12 md:mt-0 md:mb-0 md:p-4 overflow-y-auto" style={chatBgStyle}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00a884]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-500 text-sm md:text-base">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} id={`message-${message._id}`}>
                <MessageBubble
                  key={index}
                  message={message}
                  isOwnMessage={message.sender === username}
                isGroupChat={isGroupChat}
                  isAdmin={isAdmin}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  handleDeleteMessage={handleDeleteMessage}
                  handleReplyMessage={handleReplyMessage}
                  handleEmojiReaction={handleEmojiReaction}
                  scrollToMessage={scrollToMessage}
                  username={username}

                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 text-xs md:text-sm">
          {error}
        </div>
      )}

      {/* // Add reply UI above message input */}
      {replyingTo && (
        <div className="px-3 py-2 bg-gray-100 border-l-4 border-blue-500 mx-4 rounded">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs text-blue-600 font-medium">
                Replying to {replyingTo.sender}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {replyingTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Message input - Mobile optimized */}
      <form onSubmit={handleSubmit} className="p-1.5 md:p-2 bg-[#f0f2f5] fixed w-full bottom-0 right-0 md:static md:w-auto">
        <div className="flex items-center rounded-full bg-white p-1 " >
          {/* <button
            type="button"
            className="p-1.5 md:p-2 text-gray-500 hover:text-gray-700 rounded-full"
          >
            <Smile className="h-5 w-5" />
          </button> */}

          <FileUpload onUpload={handleFileUpload} />

          <input
            type="text"
            ref={messageInputRef}
            value={newMessage}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder={connected ? "Type a message" : "Connecting..."}
            disabled={!connected}
            className="flex-1 px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base rounded-full focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {newMessage ? (
            <button
              type="submit"
              disabled={!newMessage.trim() || !connected}
              className="p-1.5 md:p-2 text-white bg-[#00a884] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <>
              <FileUpload onUpload={handleFileUpload} showCameraButton={true} />
              <VoiceRecorder onSendVoice={handleVoiceUpload} />
            </>
          )}
        </div>

        {!connected && (
          <p className="mt-1 md:mt-2 text-xs text-center text-red-500">
            Disconnected from server. Trying to reconnect...
          </p>
        )}
      </form>

      {/* Create User Dialog */}
      <Dialog open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            setIsEditMode(false);
            setUserToEdit(null);
          }
        }}
      >
        <CreateUser
          socket={socket}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          isEditMode={isEditMode}
          userToEdit={userToEdit}
          setIsEditMode={setIsEditMode}
          setUserToEdit={setUserToEdit}
        />
      </Dialog>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        users={users}
        socket={socket}
        username={username}
        isEdit={isGroupEditMode}
        setIsGroupEditMode={setIsGroupEditMode}
        groupToEdit={groupToEdit}
        setGroupToEdit={setGroupToEdit}

      />

    </div>
  );
}