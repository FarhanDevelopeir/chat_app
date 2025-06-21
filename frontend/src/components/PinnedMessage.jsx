'use client';

import { PinOff, Pin } from "lucide-react";

export default function PinnedMessage({ 
  message, 
  onUnpin, 
  onScrollToMessage, 
  isAdmin, 
  username 
}) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

//   const canUnpin = isAdmin || message.sender === username;

  return (
    <div className="sticky  top-0   z-20 bg-amber-50 border-b-2 border-amber-200 p-3 shadow-sm">
      <div className="flex items-center justify-between cursor-pointer  "
      
      >
        <div className="flex items-center gap-2 flex-1 group"
         onClick={() => onScrollToMessage(message._id)}
        >
          <Pin className="h-4 w-4 text-amber-600" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-amber-700">
                Pinned by {message.pinnedBy}
              </span>
              <span className="text-xs text-amber-600">{formattedTime}</span>
            </div>
            <p 
              className="text-sm text-gray-700 truncate  group-hover:text-blue-600"
             
              title="Click to go to message"
            >
              {message.sender}: {message.content}
            </p>
          </div>
        </div>
        
        {/* {canUnpin && ( */}
          <button
            onClick={() => onUnpin(message._id)}
            className="ml-2 p-1 rounded hover:bg-amber-100 text-amber-600 cursor-pointer"
            title="Unpin message"
          >
            <PinOff className="h-4 w-4" />
          </button>
        {/* )} */}
      </div>
    </div>
  );
}