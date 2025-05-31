
// implement resposnive design for the chat interface and user list
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UsersList from '../../components/UserList';
import ChatInterface from '../../components/ChatInterface';
import AdminLoginForm from '@/components/AdminLoginForm';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  CircleUser,
  ArrowLeft
} from 'lucide-react';
import ChatLoader from '@/components/ChatLoader';
import GroupsList from '@/components/GroupList';
import CreateGroupDialog from '@/components/GroupDialogue';

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
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile view control
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'groups'
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  // Check for mobile viewports
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // When a user is selected on mobile, show the chat
  useEffect(() => {
    if ((selectedUser || selectedGroup) && isMobile) {
      setShowChat(true);
    }
  }, [selectedUser, isMobile, selectedGroup]);

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

  useEffect(() => {
    if (socket && isLoggedIn) {
      // Fetch groups for admin
      socket.emit('groups:fetch', { username: 'admin' });

      // Listen for groups list updates
      socket.on('groups:list', (groupsList) => {
        // Filter groups where admin is a member
        const adminGroups = groupsList.filter(group =>
          group.members.includes('admin')
        );
        setGroups(adminGroups);
      });

      // Listen for new group creation
      socket.on('group:created', (data) => {
        if (data.group.members.includes('admin')) {
          setGroups(prev => [data.group, ...prev]);
        }
      });
      socket.on('group:updated', (data) => {
        if (data.group.members.includes('admin')) {
          setGroups(prev =>
            prev.map(group =>
              group._id === data.group._id ? data.group : group
            )
          );
        }
      })

      return () => {
        socket.off('groups:list');
        socket.off('group:created');
        socket.off('group:updated');
      };
    }
  }, [socket, isLoggedIn]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedUser(null); // Clear selected user when selecting group
  };

  const handleSelectUser = (username) => {
    setSelectedUser(username);
    setSelectedGroup(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear selections when switching tabs
    if (tab === 'users') {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout');
  };

  const handleBackClick = () => {
    setShowChat(false);
  };

  if (loading) {
    return <ChatLoader />;
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
        {/* UsersList - Hidden on mobile when showing chat */}
        <div className={`${isMobile && showChat ? 'hidden' : 'w-full'} md:w-1/4 border-r border-slate-200 bg-white shadow-sm overflow-hidden`}>
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => handleTabChange('users')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'users'
                ? 'text-[#00a884] border-b-2 border-[#00a884] bg-slate-50'
                : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              Users
            </button>
            <button
              onClick={() => handleTabChange('groups')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'groups'
                ? 'text-[#00a884] border-b-2 border-[#00a884] bg-slate-50'
                : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              Groups
            </button>
          </div>
          {/* Tab Content */}
          {activeTab === 'users' ? (
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
          ) : (
            <GroupsList
              groups={groups}
              onSelectGroup={handleSelectGroup}
              selectedGroup={selectedGroup}
              setIsLoggedIn={setIsLoggedIn}
              socket={socket}
              setCreateGroupOpen={setCreateGroupOpen}
            />
          )}
        </div>

        {/* ChatInterface - Full width on mobile when showing chat */}
        <div className={`${isMobile && !showChat ? 'hidden' : 'w-full'} md:flex-1 overflow-hidden`}>
          <ChatInterface
            isAdmin={true}
            selectedUser={selectedUser}
            selectedGroup={selectedGroup}
            users={users}
            groups={groups}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            setUserToEdit={setUserToEdit}
            setIsEditMode={setIsEditMode}
            userToEdit={userToEdit}
            isEditMode={isEditMode}
            newUsername={newUsername}
            newPassword={newPassword}
            setNewUsername={setNewUsername}
            setNewPassword={setNewPassword}
            chatType={selectedGroup ? 'group' : 'user'}
            onBackClick={isMobile ? handleBackClick : null}
          />
        </div>
      </div>
      <CreateGroupDialog
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        users={users}
        socket={socket}
        username={'admin'}
      />


    </div>
  );
}