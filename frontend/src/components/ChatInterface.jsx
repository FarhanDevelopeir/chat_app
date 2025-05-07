'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import MessageBubble from './MessageBubble';

export default function ChatInterface({ isAdmin = false, selectedUser = null }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
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
    
    // Set up socket event listeners
    socket.on('messages:history', handleMessagesHistory);
    socket.on('message:receive', handleReceiveMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('message:error', handleMessageError);
    socket.on('messages:updated', handleMessagesUpdated);
    socket.on('user:typing', handleUserTyping);
    socket.on('user:stopTyping', handleUserStopTyping);
    
    // Cleanup
    return () => {
      socket.off('messages:history', handleMessagesHistory);
      socket.off('message:receive', handleReceiveMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('message:error', handleMessageError);
      socket.off('messages:updated', handleMessagesUpdated);
      socket.off('user:typing', handleUserTyping);
      socket.off('user:stopTyping', handleUserStopTyping);
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
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
            {isAdmin ? selectedUser?.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {isAdmin ? selectedUser : 'Admin Support'}
          </p>
          {typing && (
            <p className="text-xs text-gray-500 animate-pulse">typing...</p>
          )}
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
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
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            ref={messageInputRef}
            value={newMessage}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder={connected ? "Type a message..." : "Connecting..."}
            disabled={!connected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            Send
          </button>
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