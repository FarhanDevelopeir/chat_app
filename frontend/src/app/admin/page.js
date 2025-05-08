'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UsersList from '../../components/UserList';
import ChatInterface from '../../components/ChatInterface';
import AdminLoginForm from '@/components/AdminLoginForm';

export default function AdminChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { socket } = useSocket();

  // Admin login effect
  // useEffect(() => {
  //   if (!socket) return;

  //   // Try to login as admin
  //   socket.emit('admin:login');

  //   const handleLoginSuccess = () => {
  //     setIsLoggedIn(true);
  //     setLoading(false);
  //   };

  //   const handleUserList = (userList) => {
  //     setUsers(userList);
  //   };

  //   socket.on('admin:loginSuccess', handleLoginSuccess);
  //   socket.on('admin:userList', handleUserList);

  //   return () => {
  //     socket.off('admin:loginSuccess', handleLoginSuccess);
  //     socket.off('admin:userList', handleUserList);
  //   };
  // }, [socket]);

  // const handleSelectUser = (username) => {
  //   setSelectedUser(username);
  // };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <p>Loading admin panel...</p>
  //     </div>
  //   );
  // }

  // if (!isLoggedIn) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <p>Authentication failed. Please refresh and try again.</p>
  //     </div>
  //   );
  // }


  useEffect(() => {
    const alreadyLoggedIn = localStorage.getItem('adminLoggedIn');
    if (alreadyLoggedIn === 'true' && socket) {
      socket.emit('admin:login'); // 👈 emit login on refresh
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [socket]); // 👈 make sure this re-runs when socket is ready


  useEffect(() => {
    if (!socket ) return;

    const handleUserList = (userList) => {
      setUsers(userList);
    };

    socket.on('admin:userList', handleUserList);

    return () => {
      socket.off('admin:userList', handleUserList);
    };
  }, [socket]);

  const handleSelectUser = (username) => {
    setSelectedUser(username);
  };

  // Function to handle logout
  const handleLogout = () => {

    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout'); // 👈 emit logout event to server
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLoginForm onSuccess={() => setIsLoggedIn(true)} />;
  }


  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 flex justify-between  bg-gray-800 text-white">
        <h1 className="text-xl font-bold">Admin Chat Panel</h1>
        <button
          className="ml-auto bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          // onClick={() => {
          //   localStorage.removeItem('adminLoggedIn');
          //   setIsLoggedIn(false);
          // }}
          onClick={handleLogout}
        >
          Logout
        </button>

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