'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Send, Paperclip, Smile, Mic, CheckCheck, Check, Edit } from 'lucide-react';
import FileMessage from './FileMessage';
import FileUpload from './FileUpload';
import VoiceRecorder from './VoiceRecorder';
import AudioMessage from './AudioMessage';
// import chatBg from '../../public/chat-bg.jpg';
import { CheckCircle, Star } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import CreateUser from './CreateUser';



const MessageBubble = ({ message, isOwnMessage }) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isFileMessage = message.file !== undefined;
  const isVoiceMessage = message.audio !== undefined;

  console.log('message', message)

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`px-3 py-2 rounded-lg max-w-[70%] break-words ${isOwnMessage
          ? 'bg-[#d9fdd3] text-gray-800'
          : 'bg-white text-gray-800'
          }`}
      >
        {isVoiceMessage ? (
          <AudioMessage audioData={message.audio.data} />
        ) : isFileMessage ? (
          <FileMessage file={message.file} />
        ) : (
          <p className="mb-1">{message.content}</p>
        )}

        <div className="flex items-center justify-end text-xs text-gray-500 mt-1">
          <span>{formattedTime}</span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.isRead ?
                <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" /> :
                <Check className="h-3.5 w-3.5" />
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


export default function ChatInterface({ isAdmin = false, selectedUser = null, users=null, dialogOpen=null, setDialogOpen= null, setUserToEdit=null, setIsEditMode=null,
            userToEdit=null,
            isEditMode=null,
            newUsername=null,
            newPassword=null,
            setNewUsername=null,
            setNewPassword=null,
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



  // for Editing user
  


  const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
  const receiver = isAdmin ? selectedUser : 'admin';


  console.log('isAdmin', isAdmin, 'selectedUser', selectedUser);

  // useEffect(() => {
  //   if (!socket) return;

  //   const handleUserList = (userList) => {
  //     setUsers(userList);
  //   };

  //   socket.on('admin:userList', handleUserList);

  //   return () => {
  //     socket.off('admin:userList', handleUserList);
  //   };
  // }, [socket]);


  const removeDuplicateMessages = (messages) => {
    const uniqueMessages = [];
    const seen = new Set();

    for (const message of messages) {
      // Create a unique identifier using multiple properties
      const identifier = `${message.content}-${message.sender}-${message.receiver}-${message.createdAt}`;

      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueMessages.push(message);
      }
    }

    return uniqueMessages;
  };


  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on input when chat opens
  useEffect(() => {
    if (!loading) {
      messageInputRef.current?.focus();
    }
  }, [loading, isAdmin, selectedUser]);


  // Update useEffect to handle messages
  useEffect(() => {
    if (!socket) return;

    // Handle receiving message history
    const handleMessagesHistory = (messageHistory) => {
      // Remove any duplicates that might be in the message history
      const uniqueMessages = removeDuplicateMessages(messageHistory);
      setMessages(uniqueMessages);
      setLoading(false);

      // Mark all unread messages as read
      const unreadMessages = uniqueMessages.filter(
        msg => !msg.isRead && msg.receiver === username
      );

      if (unreadMessages.length > 0) {
        unreadMessages.forEach(msg => {
          socket.emit('messages:markRead', {
            sender: msg.sender,
            receiver: msg.receiver
          });
        });
      }
    };

    const handleReceiveMessage = (message) => {
      setMessages(prevMessages => {
        // First check if this message already exists in our state
        const messageExists = prevMessages.some(m =>
          (m._id && m._id === message._id) ||
          (m.content === message.content &&
            m.sender === message.sender &&
            m.receiver === message.receiver &&
            Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 5000)
        );

        // If message already exists, don't add it again
        if (messageExists) return prevMessages;

        // For admin, only show messages related to the selected user
        if (isAdmin && message.sender !== selectedUser && message.receiver !== selectedUser) {
          return prevMessages;
        }

        // Add the new message
        const newMessages = [...prevMessages, message];

        // Ensure no duplicates
        return removeDuplicateMessages(newMessages);
      });

      // Mark message as read if we're the receiver
      if (message.receiver === username) {
        if (!isAdmin || (isAdmin && selectedUser === message.sender)) {
          socket.emit('messages:markRead', {
            sender: message.sender,
            receiver: message.receiver
          });
        }
      }

      // Play notification sound if the message is from the other party
      if (message.sender !== username) {
        try {
          const audio = new Audio('https://res.cloudinary.com/duqzgojyp/video/upload/v1737207753/tpnevoboszj1rnsdsto1.mp3');
          audio.play().catch(err => console.log('Audio play error:', err));
        } catch (error) {
          console.log('Notification sound error:', error);
        }
      }
    };

    // Handle message sent confirmation
    const handleMessageSent = (message) => {
      // When server confirms a message was sent, make sure we don't have duplicates
      setMessages(prevMessages => {
        // Find if we already have this message as a temporary one
        const index = prevMessages.findIndex(m =>
        (m.content === message.content &&
          m.sender === message.sender &&
          m.receiver === message.receiver &&
          !m._id)
        );

        // If found, update it with the server version
        if (index !== -1) {
          const newMessages = [...prevMessages];
          newMessages[index] = message;
          return removeDuplicateMessages(newMessages);
        }

        // If not found, add it only if it doesn't already exist
        const exists = prevMessages.some(m => m._id === message._id);
        if (exists) return prevMessages;

        return removeDuplicateMessages([...prevMessages, message]);
      });
    };

    // Set up socket event listeners
    socket.on('messages:history', handleMessagesHistory);
    socket.on('message:receive', handleReceiveMessage);
    socket.on('message:sent', handleMessageSent);
    // ... rest of your socket event listeners

    // Cleanup
    return () => {
      socket.off('messages:history', handleMessagesHistory);
      socket.off('message:receive', handleReceiveMessage);
      socket.off('message:sent', handleMessageSent);
      // ... rest of your socket event handler cleanup
    };
  }, [socket, username, isAdmin, selectedUser, receiver]);


  // Clear messages and reload when selected user changes (admin only)
  useEffect(() => {
    if (isAdmin && selectedUser && socket && connected) {
      setLoading(true);
      setMessages([]);
      socket.emit('admin:selectUser', selectedUser);
    }
  }, [isAdmin, selectedUser, socket, connected]);

  const handleTyping = () => {
    if (socket && connected) {
      socket.emit('user:typing', {
        sender: username,
        receiver
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && connected) {
      socket.emit('user:stopTyping', {
        sender: username,
        receiver
      });
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Send typing indicator
    handleTyping();

    // Set timeout to stop typing
    typingTimeout.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };



  // Replace your handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !connected) return;

    // Stop typing indicator
    handleStopTyping();

    // Only add message to state if there isn't a similar one already
    const tempMessage = {
      content: newMessage,
      sender: username,
      receiver,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prevMessages => {
      // Check if this exact message is already in state
      const isDuplicate = prevMessages.some(m =>
        m.content === tempMessage.content &&
        m.sender === tempMessage.sender &&
        m.receiver === tempMessage.receiver &&
        Math.abs(new Date(m.createdAt) - new Date(tempMessage.createdAt)) < 5000
      );

      // Only add if not a duplicate
      if (!isDuplicate) {
        return [...prevMessages, tempMessage];
      }
      return prevMessages;
    });

    // Send message via socket
    socket.emit('message:send', {
      content: newMessage,
      sender: username,
      receiver
    });

    // Clear input and timeout
    setNewMessage('');
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };




  const handleFileUpload = (fileData) => {
    if (!socket || !connected) return;

    console.log('fileData', fileData)

    const fileDescription = fileData.type === 'image'
      ? `[Image: ${fileData.name}]`
      : `[Document: ${fileData.name}]`;

    // Create file message
    const fileMessage = {
      content: fileDescription,
      sender: username,
      receiver,
      createdAt: new Date().toISOString(),
      isRead: false,
      file: fileData
    };

    // Add to message state (optimistic UI)
    setMessages(prev => [...prev, fileMessage]);

    // In a real app, you would upload the file to a server first
    // then send the message with the file URL via socket
    socket.emit('message:send', {
      content: fileDescription,
      sender: username,
      receiver,
      file: fileData
    });
  };


  const handleVoiceUpload = (voiceData) => {
    if (!socket || !connected) return;

    console.log('voiceData', voiceData);

    const voiceDescription = `[Voice: ${voiceData.name}]`;

    // Create voice message
    const voiceMessage = {
      content: voiceDescription,
      sender: username,
      receiver,
      createdAt: new Date().toISOString(),
      isRead: false,
      audio: voiceData
    };

    // Add to message state (optimistic UI)
    setMessages(prev => [...prev, voiceMessage]);

    // Send the voice message with the audio data via socket
    socket.emit('message:send', {
      content: voiceDescription,
      sender: username,
      receiver,
      audio: voiceData
    });
  };
  // If admin with no selected user
  if (isAdmin && !selectedUser) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f0f2f5]">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }


  const chatBgStyle = {
    backgroundImage: `url('/chat-bg.jpg')`,
    backgroundRepeat: 'repeat',
    // backgroundSize: 'cover',
    backgroundColor: '#efeae2',
    marginTop: '-10',

    // backgroundBlendMode: 'overlay',

  };


  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      {/* <div className="flex items-center justify-between p-3 bg-[#f0f2f5] border-b border-gray-200">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium">
              {isAdmin ? selectedUser?.charAt(0).toUpperCase() : 'A'}
            </div>
            {!isAdmin && adminOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900  flex items-center gap-1">
              {isAdmin ? selectedUser : 'Admin Support'}
              {!isAdmin && (
                <img
                src="/blue-tick.png"
                alt="Blue Tick"
                className="w-5 h-5"
              />
              )}

            </p>
            {typing ? (
              <p className="text-xs text-gray-500 animate-pulse">typing...</p>
            ) : (
              <p className="text-xs text-gray-500">
                {!isAdmin && (adminOnline ? 'online' : 'offline')}
              </p>
            )}
          </div>
        </div>
      </div> */}


      {/* // Updated header component */}
<div className="flex items-center justify-between p-3 bg-[#f0f2f5] border-b border-gray-200">
  <div className="flex items-center">
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium">
        {isAdmin ? selectedUser?.charAt(0).toUpperCase() : 'A'}
      </div>
      {!isAdmin && adminOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
        {isAdmin ? selectedUser : 'Admin Support'}
        {!isAdmin && (
          <img
            src="/blue-tick.png"
            alt="Blue Tick"
            className="w-5 h-5"
          />
        )}
      </p>
      {typing ? (
        <p className="text-xs text-gray-500 animate-pulse">typing...</p>
      ) : (
        <p className="text-xs text-gray-500">
          {!isAdmin && (adminOnline ? 'online' : 'offline')}
        </p>
      )}
    </div>
  </div>
  
  {/* Edit button - only show for admin when a user is selected */}
  {isAdmin && selectedUser && (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        // Find the selected user's data
        const userToEdit = users.find(user => user.username === selectedUser);
        setUserToEdit(userToEdit);
        setIsEditMode(true);
        setDialogOpen(true);
      }}
      className="flex items-center gap-2"
    >
      <Edit className="h-4 w-4" />
      Edit
    </Button>
  )}
</div>




      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto" style={chatBgStyle}>
      
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00a884]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isOwnMessage={message.sender === username}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-2 bg-[#f0f2f5]">
        <div className="flex items-center rounded-full bg-white p-1">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
          >
            <Smile className="h-5 w-5" />
          </button>

          <FileUpload onUpload={handleFileUpload} />

          <input
            type="text"
            ref={messageInputRef}
            value={newMessage}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder={connected ? "Type a message" : "Connecting..."}
            disabled={!connected}
            className="flex-1 px-3 py-2 rounded-full focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {newMessage ? (
            <button
              type="submit"
              disabled={!newMessage.trim() || !connected}
              className="p-2 text-white bg-[#00a884] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="mt-2 text-xs text-center text-red-500">
            Disconnected from server. Trying to reconnect...
          </p>
        )}
      </form>


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
          />
          
      </Dialog> 
    </div>
  );
} 
