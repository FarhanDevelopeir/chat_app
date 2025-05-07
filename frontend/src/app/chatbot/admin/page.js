'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UsersList from '../../../../../frontend/src/components/UserList';
import ChatInterface from '../../../../../frontend/src/components/ChatInterface';

export default function AdminChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { socket } = useSocket();
  
  // Admin login effect
  useEffect(() => {
    if (!socket) return;
    
    // Try to login as admin
    socket.emit('admin:login');
    
    const handleLoginSuccess = () => {
      setIsLoggedIn(true);
      setLoading(false);
    };
    
    const handleUserList = (userList) => {
      setUsers(userList);
    };
    
    socket.on('admin:loginSuccess', handleLoginSuccess);
    socket.on('admin:userList', handleUserList);
    
    return () => {
      socket.off('admin:loginSuccess', handleLoginSuccess);
      socket.off('admin:userList', handleUserList);
    };
  }, [socket]);
  
  const handleSelectUser = (username) => {
    setSelectedUser(username);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin panel...</p>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Authentication failed. Please refresh and try again.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">Admin Chat Panel</h1>
      </header>
      
      <div className="flex flex-1">
        <div className="w-1/4 border-r border-gray-200">
          <UsersList 
            users={users} 
            onSelectUser={handleSelectUser} 
            selectedUser={selectedUser} 
          />
        </div>
        
        <div className="flex-1">
          <ChatInterface isAdmin={true} selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
}