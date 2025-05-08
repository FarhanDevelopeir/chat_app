// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useSocket } from '@/context/SocketContext';
// import MessageBubble from './MessageBubble';

// export default function ChatInterface({ isAdmin = false, selectedUser = null }) {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [typing, setTyping] = useState(false);
//   const [error, setError] = useState(null);
//   const { socket, connected } = useSocket();
//   const messagesEndRef = useRef(null);
//   const messageInputRef = useRef(null);
//   const typingTimeout = useRef(null);
  
//   const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
//   const receiver = isAdmin ? selectedUser : 'admin';
  
//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);
  
//   // Focus on input when chat opens
//   useEffect(() => {
//     if (!loading) {
//       messageInputRef.current?.focus();
//     }
//   }, [loading, isAdmin, selectedUser]);
  
//   useEffect(() => {
//     if (!socket) return;
    
//     // Handle receiving message history
//     const handleMessagesHistory = (messageHistory) => {
//       setMessages(messageHistory);
//       setLoading(false);
      
//       // Mark all unread messages as read
//       const unreadMessages = messageHistory.filter(
//         msg => !msg.isRead && msg.receiver === username
//       );
      
//       if (unreadMessages.length > 0) {
//         unreadMessages.forEach(msg => {
//           socket.emit('messages:markRead', {
//             sender: msg.sender,
//             receiver: msg.receiver
//           });
//         });
//       }
//     };
    
//     // Handle receiving a new message
//     const handleReceiveMessage = (message) => {
//       setMessages(prev => [...prev, message]);
      
//       // Mark message as read if we're the receiver and this is the active chat
//       if (message.receiver === username) {
//         // For admin, only mark as read if this user is selected
//         const shouldMarkRead = !isAdmin || (isAdmin && selectedUser === message.sender);
        
//         if (shouldMarkRead) {
//           socket.emit('messages:markRead', {
//             sender: message.sender,
//             receiver: message.receiver
//           });
//         }
//       }
      
//       // Play notification sound if the message is from the other party
//       if (message.sender !== username) {
//         try {
//           const audio = new Audio('/notification.mp3');
//           audio.play().catch(err => console.log('Audio play error:', err));
//         } catch (error) {
//           console.log('Notification sound error:', error);
//         }
//       }
//     };
    
//     // Handle message sent confirmation
//     const handleMessageSent = (message) => {
//       // Update the optimistic message with server data
//       setMessages(prev => {
//         const index = prev.findIndex(m => 
//           m.content === message.content && 
//           m.sender === message.sender && 
//           m.receiver === message.receiver && 
//           !m._id
//         );
        
//         if (index !== -1) {
//           const newMessages = [...prev];
//           newMessages[index] = message;
//           return newMessages;
//         }
        
//         return [...prev, message];
//       });
//     };
    
//     // Handle messages updated (marked as read)
//     const handleMessagesUpdated = () => {
//       setMessages(prev => {
//         return prev.map(msg => {
//           // Update read status for messages sent by this user
//           if (msg.sender === username && !msg.isRead) {
//             return { ...msg, isRead: true };
//           }
//           return msg;
//         });
//       });
//     };
    
//     // Handle message error
//     const handleMessageError = ({ error }) => {
//       setError(`Error sending message: ${error}`);
//       setTimeout(() => setError(null), 5000);
//     };
    
//     // Typing indicators
//     const handleUserTyping = ({ sender }) => {
//       if ((isAdmin && sender === selectedUser) || (!isAdmin && sender === 'admin')) {
//         setTyping(true);
//       }
//     };
    
//     const handleUserStopTyping = ({ sender }) => {
//       if ((isAdmin && sender === selectedUser) || (!isAdmin && sender === 'admin')) {
//         setTyping(false);
//       }
//     };
    
//     // Set up socket event listeners
//     socket.on('messages:history', handleMessagesHistory);
//     socket.on('message:receive', handleReceiveMessage);
//     socket.on('message:sent', handleMessageSent);
//     socket.on('message:error', handleMessageError);
//     socket.on('messages:updated', handleMessagesUpdated);
//     socket.on('user:typing', handleUserTyping);
//     socket.on('user:stopTyping', handleUserStopTyping);
    
//     // Cleanup
//     return () => {
//       socket.off('messages:history', handleMessagesHistory);
//       socket.off('message:receive', handleReceiveMessage);
//       socket.off('message:sent', handleMessageSent);
//       socket.off('message:error', handleMessageError);
//       socket.off('messages:updated', handleMessagesUpdated);
//       socket.off('user:typing', handleUserTyping);
//       socket.off('user:stopTyping', handleUserStopTyping);
//     };
//   }, [socket, username, isAdmin, selectedUser, receiver]);
  
//   // Clear messages and reload when selected user changes (admin only)
//   useEffect(() => {
//     if (isAdmin && selectedUser && socket && connected) {
//       setLoading(true);
//       setMessages([]);
//       socket.emit('admin:selectUser', selectedUser);
//     }
//   }, [isAdmin, selectedUser, socket, connected]);
  
//   const handleTyping = () => {
//     if (socket && connected) {
//       socket.emit('user:typing', {
//         sender: username,
//         receiver
//       });
//     }
//   };
  
//   const handleStopTyping = () => {
//     if (socket && connected) {
//       socket.emit('user:stopTyping', {
//         sender: username,
//         receiver
//       });
//     }
//   };
  
//   const handleInputChange = (e) => {
//     setNewMessage(e.target.value);
    
//     // Clear existing timeout
//     if (typingTimeout.current) {
//       clearTimeout(typingTimeout.current);
//     }
    
//     // Send typing indicator
//     handleTyping();
    
//     // Set timeout to stop typing
//     typingTimeout.current = setTimeout(() => {
//       handleStopTyping();
//     }, 2000);
//   };
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!newMessage.trim() || !socket || !connected) return;
    
//     // Stop typing indicator
//     handleStopTyping();
    
//     // Add message to state immediately (optimistic UI)
//     const tempMessage = {
//       content: newMessage,
//       sender: username,
//       receiver,
//       createdAt: new Date().toISOString(),
//       isRead: false
//     };
    
//     setMessages(prev => [...prev, tempMessage]);
    
//     // Send message via socket
//     socket.emit('message:send', {
//       content: newMessage,
//       sender: username,
//       receiver
//     });
    
//     // Clear input and timeout
//     setNewMessage('');
//     if (typingTimeout.current) {
//       clearTimeout(typingTimeout.current);
//     }
//   };
  
//   // If admin with no selected user
//   if (isAdmin && !selectedUser) {
//     return (
//       <div className="flex items-center justify-center h-full bg-gray-50">
//         <p className="text-gray-500">Select a user to start chatting</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="flex flex-col h-full">
//       {/* Chat header */}
//       <div className="flex items-center p-4 border-b border-gray-200 bg-white">
//         <div className="flex-shrink-0">
//           <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
//             {isAdmin ? selectedUser?.charAt(0).toUpperCase() : 'A'}
//           </div>
//         </div>
//         <div className="ml-3">
//           <p className="text-sm font-medium text-gray-900">
//             {isAdmin ? selectedUser : 'Admin Support'}
//           </p>
//           {typing && (
//             <p className="text-xs text-gray-500 animate-pulse">typing...</p>
//           )}
//         </div>
//       </div>
      
//       {/* Messages area */}
//       <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//         {loading ? (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-gray-500">Loading messages...</p>
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-gray-500">No messages yet. Start the conversation!</p>
//           </div>
//         ) : (
//           <>
//             {messages.map((message, index) => (
//               <MessageBubble
//                 key={message._id || `${message.sender}-${index}`}
//                 message={message}
//                 isOwnMessage={message.sender === username}
//               />
//             ))}
//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </div>
      
//       {/* Error message */}
//       {error && (
//         <div className="px-4 py-2 bg-red-100 text-red-700 text-sm">
//           {error}
//         </div>
//       )}
      
//       {/* Message input */}
//       <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
//         <div className="flex items-center">
//           <input
//             type="text"
//             ref={messageInputRef}
//             value={newMessage}
//             onChange={handleInputChange}
//             onBlur={handleStopTyping}
//             placeholder={connected ? "Type a message..." : "Connecting..."}
//             disabled={!connected}
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//           />
//           <button
//             type="submit"
//             disabled={!newMessage.trim() || !connected}
//             className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
//           >
//             Send
//           </button>
//         </div>
        
//         {!connected && (
//           <p className="mt-2 text-xs text-center text-red-500">
//             Disconnected from server. Trying to reconnect...
//           </p>
//         )}
//       </form>
//     </div>
//   );
// }


'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Send, Paperclip, Smile, Mic, CheckCheck, Check } from 'lucide-react';

// Updated MessageBubble component with WhatsApp styling
const MessageBubble = ({ message, isOwnMessage }) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div 
        className={`px-3 py-2 rounded-lg max-w-[70%] break-words ${
          isOwnMessage 
            ? 'bg-[#d9fdd3] text-gray-800' 
            : 'bg-white text-gray-800'
        }`}
      >
        <p className="mb-1">{message.content}</p>
        <div className="flex items-center justify-end text-xs text-gray-500">
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

export default function ChatInterface({ isAdmin = false, selectedUser = null }) {
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
  
  const username = isAdmin ? 'admin' : localStorage.getItem('chat_username');
  const receiver = isAdmin ? selectedUser : 'admin';
  
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
  
  useEffect(() => {
    if (!socket) return;
    
    // Handle receiving message history
    const handleMessagesHistory = (messageHistory) => {
      setMessages(messageHistory);
      setLoading(false);
      
      // Mark all unread messages as read
      const unreadMessages = messageHistory.filter(
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
    
    // Handle receiving a new message
    const handleReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark message as read if we're the receiver and this is the active chat
      if (message.receiver === username) {
        // For admin, only mark as read if this user is selected
        const shouldMarkRead = !isAdmin || (isAdmin && selectedUser === message.sender);
        
        if (shouldMarkRead) {
          socket.emit('messages:markRead', {
            sender: message.sender,
            receiver: message.receiver
          });
        }
      }
      
      // Play notification sound if the message is from the other party
      if (message.sender !== username) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(err => console.log('Audio play error:', err));
        } catch (error) {
          console.log('Notification sound error:', error);
        }
      }
    };
    
    // Handle message sent confirmation
    const handleMessageSent = (message) => {
      // Update the optimistic message with server data
      setMessages(prev => {
        const index = prev.findIndex(m => 
          m.content === message.content && 
          m.sender === message.sender && 
          m.receiver === message.receiver && 
          !m._id
        );
        
        if (index !== -1) {
          const newMessages = [...prev];
          newMessages[index] = message;
          return newMessages;
        }
        
        return [...prev, message];
      });
    };
    
    // Handle messages updated (marked as read)
    const handleMessagesUpdated = () => {
      setMessages(prev => {
        return prev.map(msg => {
          // Update read status for messages sent by this user
          if (msg.sender === username && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      });
    };
    
    // Handle message error
    const handleMessageError = ({ error }) => {
      setError(`Error sending message: ${error}`);
      setTimeout(() => setError(null), 5000);
    };
    
    // Typing indicators
    const handleUserTyping = ({ sender }) => {
      if ((isAdmin && sender === selectedUser) || (!isAdmin && sender === 'admin')) {
        setTyping(true);
      }
    };
    
    const handleUserStopTyping = ({ sender }) => {
      if ((isAdmin && sender === selectedUser) || (!isAdmin && sender === 'admin')) {
        setTyping(false);
      }
    };

    // Admin status
    const handleAdminStatus = (status) => {
      setAdminOnline(status.isOnline);
    };
    
    // Set up socket event listeners
    socket.on('messages:history', handleMessagesHistory);
    socket.on('message:receive', handleReceiveMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('message:error', handleMessageError);
    socket.on('messages:updated', handleMessagesUpdated);
    socket.on('user:typing', handleUserTyping);
    socket.on('user:stopTyping', handleUserStopTyping);
    socket.on('admin:status', handleAdminStatus);
    
    // Request admin status
    if (!isAdmin) {
      socket.emit('user:requestAdminStatus');
    }
    
    // Cleanup
    return () => {
      socket.off('messages:history', handleMessagesHistory);
      socket.off('message:receive', handleReceiveMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('message:error', handleMessageError);
      socket.off('messages:updated', handleMessagesUpdated);
      socket.off('user:typing', handleUserTyping);
      socket.off('user:stopTyping', handleUserStopTyping);
      socket.off('admin:status', handleAdminStatus);
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !connected) return;
    
    // Stop typing indicator
    handleStopTyping();
    
    // Add message to state immediately (optimistic UI)
    const tempMessage = {
      content: newMessage,
      sender: username,
      receiver,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
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
  
  // If admin with no selected user
  if (isAdmin && !selectedUser) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f0f2f5]">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }
  
  // WhatsApp themed chat background
  const chatBgStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23e5e7eb' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundColor: '#efeae2'
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
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
            <p className="text-sm font-medium text-gray-900">
              {isAdmin ? selectedUser : 'Admin Support'}
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
                key={message._id || `${message.sender}-${index}`}
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
          
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
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
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {!connected && (
          <p className="mt-2 text-xs text-center text-red-500">
            Disconnected from server. Trying to reconnect...
          </p>
        )}
      </form>
    </div>
  );
}