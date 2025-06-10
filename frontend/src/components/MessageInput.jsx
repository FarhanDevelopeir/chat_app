// 4. MessageInput.jsx - Message input component
'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import FileUpload from './FileUpload';
import VoiceRecorder from './VoiceRecorder';

export default function MessageInput({
  connected,
  onSubmit,
  onFileUpload,
  onVoiceUpload,
  onInputChange,
  onStopTyping,
  messageInputRef
}) {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !connected) return;
    
    onSubmit(newMessage);
    setNewMessage('');
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    onInputChange(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="p-1.5 md:p-2 bg-[#f0f2f5] fixed w-full bottom-0 right-0 md:static md:w-auto">
      <div className="flex items-center rounded-full bg-white p-1">
        <FileUpload onUpload={onFileUpload} />

        <input
          type="text"
          ref={messageInputRef}
          value={newMessage}
          onChange={handleInputChange}
          onBlur={onStopTyping}
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
            <FileUpload onUpload={onFileUpload} showCameraButton={true} />
            <VoiceRecorder onSendVoice={onVoiceUpload} />
          </>
        )}
      </div>

      {!connected && (
        <p className="mt-1 md:mt-2 text-xs text-center text-red-500">
          Disconnected from server. Trying to reconnect...
        </p>
      )}
    </form>
  );
}