


'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UsersList from '../../components/UserList';
import ChatInterface from '../../components/ChatInterface';
import AdminLoginForm from '@/components/AdminLoginForm';
import { Button } from '@/components/ui/button';
import { 
  LogOut,
  CircleUser
} from 'lucide-react';
import ChatLoader from '@/components/ChatLoader';

export default function AdminChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { socket } = useSocket();
  const [isEditMode, setIsEditMode] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');


  useEffect(() => {
    const alreadyLoggedIn = localStorage.getItem('adminLoggedIn');
    if (alreadyLoggedIn === 'true' && socket) {
      socket.emit('admin:login'); 
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

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

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout');
  };

  if (loading) {
    return (
     
      <>
      <ChatLoader/>
      </>
    );
  }

  // Render both admin login and chat interface, but blur and disable chat when not logged in
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {!isLoggedIn && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
          <AdminLoginForm onSuccess={() => setIsLoggedIn(true)} />
        </div>
      )}


      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r border-slate-200 bg-white shadow-sm overflow-hidden">
          <UsersList
            socket={socket}
            users={users}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
            setIsLoggedIn={setIsLoggedIn}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            userToEdit={userToEdit}
            isEditMode={isEditMode}
            newUsername={newUsername}
            newPassword={newPassword}
            setNewUsername={setNewUsername}
            setNewPassword={setNewPassword}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface isAdmin={true} selectedUser={selectedUser} users={users} dialogOpen={dialogOpen}  setDialogOpen={setDialogOpen} setUserToEdit={setUserToEdit} setIsEditMode={setIsEditMode} 
          userToEdit={userToEdit}
            isEditMode={isEditMode}
            newUsername={newUsername}
            newPassword={newPassword}
            setNewUsername={setNewUsername}
            setNewPassword={setNewPassword}
          />
        </div>
      </div>
    </div>
  );
}