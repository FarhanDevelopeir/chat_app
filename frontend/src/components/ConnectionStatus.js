'use client';

import { useSocket } from '@/context/SocketContext';

export default function ConnectionStatus() {
  const { connected, reconnecting } = useSocket();
  
  return (
    <div className="fixed bottom-4 right-4 px-3 py-1 rounded-md text-sm">
      {reconnecting ? (
        <div className="flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-md">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Reconnecting...
        </div>
      ) : connected ? (
        <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-md">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Connected
        </div>
      ) : (
        <div className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-md">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Disconnected
        </div>
      )}
    </div>
  );
}