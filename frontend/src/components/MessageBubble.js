'use client';

import { useState, useEffect, useRef } from "react";
import FileMessage from "./FileMessage";
import AudioMessage from "./AudioMessage";
import { Check, CheckCheck, ChevronDown, Reply, Trash2 } from "lucide-react";
import { Pin, PinOff } from "lucide-react";
import { SearchHighlight } from "./SearchBar";



export default function MessageBubble({
  message,
  isOwnMessage,
  isGroupChat = false,
  isAdmin,
  showEmojiPicker,
  setShowEmojiPicker,
  handleDeleteMessage,
  handleReplyMessage,
  handleEmojiReaction,
  scrollToMessage,
  username,
  showDropdown,
  setShowDropdown,
  isMobile,
  setIsMobile,

  handlePinMessage, // New prop
  handleUnpinMessage, // New prop

  searchQuery,
  isHighlighted,

}) {
  const isFileMessage = message.file !== undefined;
  const isVoiceMessage = message.audio !== undefined;
  const [showMobileButtons, setShowMobileButtons] = useState(null);


  const containerRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the clicked element is an emoji button, emoji picker, or dropdown
      const isEmojiButton = event.target.closest('[data-emoji-button]');
      const isEmojiPicker = event.target.closest('[data-emoji-picker]');
      const isDropdownButton = event.target.closest('[data-dropdown-button]');
      const isDropdownMenu = event.target.closest('[data-dropdown-menu]');
      const isMessageBubble = event.target.closest('[data-message-bubble]');

      // Don't close if clicking on emoji/dropdown related elements
      if (!isEmojiButton && !isEmojiPicker && !isDropdownButton && !isDropdownMenu && !isMessageBubble) {
        setShowEmojiPicker(null);
        setShowDropdown(null);
        setShowMobileButtons(null);
      }
    };

    // Add event listener to the document
    document.addEventListener('click', handleClickOutside);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Handle single click for mobile
  const handleMessageClick = (e) => {
    if (isMobile && !message.isDeleted) {
      e.stopPropagation();
      setShowMobileButtons(showMobileButtons === message._id ? null : message._id);
    }
  };

  // Handle double-click to reply
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!message.isDeleted) {
      handleReplyMessage(message);
    }
  };

  // Determine if buttons should be visible
  const shouldShowButtons = isMobile
    ? showMobileButtons === message._id
    : false; // On desktop, use CSS hover

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onClick={handleMessageClick}
      ref={containerRef}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 relative  group`}>
      <div
        data-message-bubble="true"

        className={`relative ${message.replyTo ? '' : 'flex justify-between items-center'} px-4 py-4 rounded-lg max-w-[80%] md:max-w-[70%] break-words    ${isOwnMessage
          ? 'bg-[#d9fdd3] text-gray-800'
          : 'bg-white text-gray-800'
          } ${message.isDeleted ? 'italic text-gray-500' : ''}`}>

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
            // <p className="mb-1 text-sm md:text-base">{message.content}</p>
             <SearchHighlight text={message.content} searchQuery={searchQuery} />
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
            data-emoji-button="true"
            onClick={(e) => {
              e.stopPropagation();
              setShowEmojiPicker(showEmojiPicker === message._id ? null : message._id)
            }}
            className={`absolute ${isOwnMessage
              ? 'top-1/2 -translate-y-1/2 -left-9'  // Changed this line
              : 'top-1/2 -translate-y-1/2 -right-9' // Changed this line
              } ${isMobile
                ? (shouldShowButtons ? 'visible' : 'invisible')
                : ' invisible group-hover:visible'
              } transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50 rounded-full p-1 shadow-lg border border-gray-200 z-10`}
            title="Add reaction"
          >
            <span className="text-base text-gray-600">😊</span>
          </button>
        )}

        {/* Message options dropdown for message owner or admin */}
        {!message.isDeleted && (
          <div className="absolute top-2 right-2">
            {/* Button container with relative positioning */}
            <div className="relative">
              <button
                data-dropdown-button="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(showDropdown === message._id ? null : message._id)
                }}
                className={`${isMobile
                  ? (shouldShowButtons ? 'visible' : 'invisible')
                  : 'invisible group-hover:visible'
                  } ${isOwnMessage ? 'group-hover:bg-[#d9fdd3]' : 'group-hover:bg-white'} shadow-2xl rounded-full transition-opacity cursor-pointer text-black hover:text-black p-1`}
                title="Message options"
              >
                <ChevronDown className="h-6 w-6" />
              </button>

              {/* Dropdown menu positioned relative to the button */}
              {showDropdown === message._id && (
                <div
                  data-dropdown-menu="true"
                  className={`absolute top-8 ${isOwnMessage ? 'right-0' : 'left-0'} z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[120px]`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplyMessage(message);
                      setShowDropdown(null);
                      setShowMobileButtons(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                  {/* Add this inside the existing dropdown menu, after the Reply button */}
                  {!message.isPinned ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinMessage(message._id);
                        setShowDropdown(null);
                        setShowMobileButtons(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Pin className="h-4 w-4" />
                      Pin
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpinMessage(message._id);
                        setShowDropdown(null);
                        setShowMobileButtons(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <PinOff className="h-4 w-4" />
                      Unpin
                    </button>
                  )}


                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message._id);
                      setShowDropdown(null);
                      setShowMobileButtons(null);
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
        <div
          data-emoji-picker="true"
          className="absolute z-30 bg-gray-800 rounded-full px-3 py-2 shadow-lg"
          style={{
            bottom: '40px',
            left: isOwnMessage ? 'auto' : '10px',
            right: isOwnMessage ? '10px' : 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
              <button
                key={emoji}
                data-emoji-button="true"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmojiReaction(message._id, emoji);
                  setShowEmojiPicker(null);
                  setShowMobileButtons(null);
                }}
                className="text-2xl hover:scale-125 transition-transform p-1"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

