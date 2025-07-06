// 3. ReplyPreview.jsx - Reply preview component
'use client';

import { X } from 'lucide-react';

export default function ReplyPreview({ replyingTo, onCancel }) {
  if (!replyingTo) return null;

  return (
    <div className="z-40 px-4 py-2 bg-gray-100 border-l-4 border-blue-500 mx-4 rounded fixed w-full bottom-12 md:bottom-0 right-0 md:static md:w-auto">
      <div className="border-l-4 border-blue-500 rounded pl-3 md:p-0 md:border-0 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs text-blue-600 font-medium">
            Replying to {replyingTo.sender}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {replyingTo.content}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}