'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

export default function AdminLoginForm({ onSuccess }) {
  const { socket } = useSocket();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 // Example inside AdminLoginForm.jsx
const handleLogin = () => {
    socket.emit('admin:loginAttempt', { username, password });
  
    socket.on('admin:loginSuccess', () => {
      localStorage.setItem('adminLoggedIn', 'true'); // ✅ store login flag
      onSuccess(); // tell parent to proceed
    });
  
    socket.on('admin:loginFailure', () => {
      alert('Login failed');
    });
  };
  

  useEffect(() => {
    if (!socket) return;

    const handleLoginSuccess = () => {
      setLoading(false);
      onSuccess(); // Notify parent
    };

    const handleLoginFailure = () => {
      setError('Invalid credentials');
      setLoading(false);
    };

    socket.on('admin:loginSuccess', handleLoginSuccess);
    socket.on('admin:loginFailure', handleLoginFailure);

    return () => {
      socket.off('admin:loginSuccess', handleLoginSuccess);
      socket.off('admin:loginFailure', handleLoginFailure);
    };
  }, [socket, onSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Admin Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          className="w-full bg-blue-600 text-white p-2 rounded mt-2"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}
