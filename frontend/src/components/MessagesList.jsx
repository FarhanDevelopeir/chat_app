// 2. MessagesList.jsx - Messages display area
'use client';

import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { scrollToMessage } from './utils/ChatInterface_functions';

export default function MessagesList({
  messages,
  loading,
  username,
  isGroupChat,
  isAdmin,
  showEmojiPicker,
  setShowEmojiPicker,
  handleDeleteMessage,
  handleReplyMessage,
  handleEmojiReaction,
  showDropdown,
  setShowDropdown,
  isMobile,
  setIsMobile
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatBgStyle = {
    backgroundImage: `url('/chat-bg.jpg')`,
    backgroundRepeat: 'repeat',
    backgroundColor: '#efeae2',
  };

  return (
    <div className="flex-1 p-2 pt-4 mb-12 mt-12 md:mt-0 md:mb-0 md:p-4 overflow-y-auto" style={chatBgStyle}>
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
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                isMobile={isMobile}
                setIsMobile={setIsMobile}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
