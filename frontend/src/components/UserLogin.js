'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';

export default function UserLogin() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { socket, connected } = useSocket();
  const router = useRouter();
  
  useEffect(() => {
    // Check if user has already logged in
    const savedUsername = localStorage.getItem('chat_username');
    const deviceId = localStorage.getItem('chat_device_id');
    
    if (savedUsername && deviceId && socket) {
      setLoading(true);
      
      // Attempt auto-login
      socket.emit('user:login', { username: savedUsername, deviceId });
    }
  }, [socket, connected]);
  
  useEffect(() => {
    if (!socket) return;
    
    // Handle login success
    const handleLoginSuccess = ({ user }) => {
      setLoading(false);
      localStorage.setItem('chat_username', user.username);
      localStorage.setItem('chat_device_id', user.deviceId);
      
      // Reload page to show chat interface
      window.location.reload();
    };
    
    // Handle login error
    const handleLoginError = ({ error }) => {
      setLoading(false);
      setError(error);
    };
    
    socket.on('user:loginSuccess', handleLoginSuccess);
    socket.on('user:loginError', handleLoginError);
    
    return () => {
      socket.off('user:loginSuccess', handleLoginSuccess);
      socket.off('user:loginError', handleLoginError);
    };
  }, [socket, router]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Generate or retrieve device ID
    let deviceId = localStorage.getItem('chat_device_id');
    if (!deviceId) {
      deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('chat_device_id', deviceId);
    }
    
    // Send login request via socket
    socket.emit('user:login', { username, deviceId });
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Chat</h1>
          <p className="mt-2 text-gray-600">Enter a username to start chatting</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading || !connected}
              className={`w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm ${
                loading || !connected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Connecting...' : 'Start Chatting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}