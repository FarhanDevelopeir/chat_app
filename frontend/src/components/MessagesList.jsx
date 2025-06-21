
// Updated MessagesList component with scroll-to-load functionality

'use client';

import { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import { scrollToMessage } from './utils/ChatInterface_functions';
import { Button } from './ui/button';
import PinnedMessage from './PinnedMessage';

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
  setIsMobile,
  // New props for pagination
  hasMoreMessages,
  loadingMoreMessages,
  onLoadMore,

  pinnedMessage, // New prop
  onPinMessage, // New prop
  onUnpinMessage, // New prop
  onScrollToPinnedMessage, // New prop

  searchQuery,
  highlightedMessageId,
  searchResults,


}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);

  // Scroll to bottom when new messages arrive (only if user was at bottom)
  useEffect(() => {
    if (isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom]);

  // Handle scroll events for loading more messages and tracking scroll position
  const handleScroll = () => {
    console.log('Scroll event triggered');

    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Check if user is at the bottom
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsScrolledToBottom(isAtBottom);

    // Check if user scrolled to top and should load more messages
    if (scrollTop === 0 && hasMoreMessages && !loadingMoreMessages) {
      console.log('Loading more messages...');

      setPreviousScrollHeight(scrollHeight);
      onLoadMore();

    }
  };

  // Add this function inside the component
  const scrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight effect
      messageElement.classList.add('bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (loadingMoreMessages === false && previousScrollHeight > 0) {
      const container = messagesContainerRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        const scrollDifference = newScrollHeight - previousScrollHeight;
        container.scrollTop = scrollDifference;
        setPreviousScrollHeight(0);
      }
    }
  }, [loadingMoreMessages, previousScrollHeight]);

  const chatBgStyle = {
    backgroundImage: `url('/chat-bg.jpg')`,
    backgroundRepeat: 'repeat',
    backgroundColor: '#efeae2',
  };

  return (
    <div
      ref={messagesContainerRef}
      // className="flex-1  mb-12 mt-12 md:mt-0 md:mb-0 md:p-0  overflow-y-auto"
      className={`flex-1 mb-12 mt-12 md:mt-0 md:mb-0 md:p-0 overflow-y-auto ${searchQuery ? 'pt-16' : ''}`}
      style={chatBgStyle}
      onScroll={handleScroll}
    >

      {/* Pinned Message Display */}
      {pinnedMessage && (
        <PinnedMessage
          message={pinnedMessage}
          onUnpin={onUnpinMessage}
          onScrollToMessage={scrollToMessage}
          isAdmin={isAdmin}
          username={username}
        />
      )}

      {/* No more messages indicator */}
      {!hasMoreMessages && messages.length > 12 ? (
        <div className="flex items-center  justify-center py-4">
          <div className="bg-white px-3 py-1 rounded-full shadow-sm">
            <span className="text-xs text-gray-500">No more messages</span>
          </div>
        </div>
      ) :
        (
          <div className="flex items-center justify-center py-4">
            <div className="bg-white px-3 py-1 rounded-full shadow-sm">
              <button className="text-xs text-gray-500 cursor-pointer" onClick={handleScroll}>Load more messages</button>
            </div>
          </div>
        )

      }

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
            <div key={message._id || index}
              // className='p-2 pt-4 md:p-4'
              className={`p-2 pt-4 md:p-4 ${highlightedMessageId === message._id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}

              id={`message-${message._id}`}>
              <MessageBubble
                message={message}
                isOwnMessage={message.sender === username}
                isGroupChat={isGroupChat}
                isAdmin={isAdmin}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                handleDeleteMessage={handleDeleteMessage}
                handleReplyMessage={handleReplyMessage}
                handleEmojiReaction={handleEmojiReaction}

                handlePinMessage={onPinMessage} // New prop
                handleUnpinMessage={onUnpinMessage} // New prop

                scrollToMessage={scrollToMessage}
                username={username}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                isMobile={isMobile}
                setIsMobile={setIsMobile}



                searchQuery={searchQuery}
                isHighlighted={highlightedMessageId === message._id}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}