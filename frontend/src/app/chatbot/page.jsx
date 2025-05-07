'use client';

import { useState, useEffect } from 'react';
import UserLogin from '@/components/UserLogin';
import ChatInterface from '@/components/ChatInterface';

export default function UserChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const username = localStorage.getItem('chat_username');
    const deviceId = localStorage.getItem('chat_device_id');
    
    if (username && deviceId) {
      setIsLoggedIn(true);
    }
    
    setLoading(false);
  }, []);
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    // Keep deviceId for future recognition
    setIsLoggedIn(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? (
        <div className="flex flex-col h-screen">
          <div className="flex items-center justify-between p-4 bg-white shadow">
            <h1 className="text-xl font-semibold">Chat Support</h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          <div className="flex-1">
            <ChatInterface />
          </div>
        </div>
      ) : (
        <UserLogin onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}