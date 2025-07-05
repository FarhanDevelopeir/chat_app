
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
  const [currentUser, setCurrentUser] = useState(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [userType, setUserType] = useState(null);

  // Updated useEffect for socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleGroupsListUpdated = (updatedGroups) => {
      // Filter groups where current user is a member
      const currentUsername = userType === 'admin' ? 'admin' : currentUser?.username;
      if (currentUsername) {
        const userGroups = updatedGroups.filter(group =>
          group.members.includes(currentUsername)
        );
        setGroups(userGroups);
      }
    };


   

    const handleGroupMessage = (message) => {
      // Fetch fresh groups list to ensure proper sorting
      if (socket && currentUser) {
        const username = userType === 'admin' ? 'admin' : currentUser.username;
        socket.emit('groups:fetch', { username });
      }
    };

    socket.on('groups:listUpdated', handleGroupsListUpdated);
    socket.on('group:messageReceive', handleGroupMessage);

    return () => {
      socket.off('groups:listUpdated', handleGroupsListUpdated);
      socket.off('group:messageReceive', handleGroupMessage);
    };
  }, [socket]);

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
    const storedUserType = localStorage.getItem('userType');
    if (alreadyLoggedIn === 'true' && socket && storedUserType) {
      if (storedUserType === 'admin') {
        socket.emit('admin:login');
      } else if (storedUserType === 'subadmin') {
        const storedUsername = localStorage.getItem('subAdminUsername');
        if (storedUsername) {
          socket.emit('subadmin:isLogin', { username: storedUsername });
        }
      }
      setUserType(storedUserType);
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

    const handleSubAdminUserList = (userList) => {
      setUsers(userList);
    };

    socket.on('admin:userList', handleUserList);
    socket.on('subadmin:userList', handleSubAdminUserList);

    return () => {
      socket.off('admin:userList', handleUserList);
      socket.off('subadmin:userList', handleSubAdminUserList);
    };
  }, [socket]);



  useEffect(() => {
    if (socket && isLoggedIn && userType) {
      const username = userType === 'admin' ? 'admin' : currentUser?.username;
      if (username) {
        // Fetch groups for current user
        socket.emit('groups:fetch', { username });
      }

      // Listen for groups list updates
      socket.on('groups:list', (groupsList) => {
        // Filter groups where current user is a member
        const currentUsername = userType === 'admin' ? 'admin' : currentUser?.username;
        if (currentUsername) {
          const userGroups = groupsList.filter(group =>
            group.members.includes(currentUsername)
          );
          setGroups(userGroups);
        }
      });

      // Listen for new group creation
      socket.on('group:created', (data) => {
        const currentUsername = userType === 'admin' ? 'admin' : currentUser?.username;
        if (currentUsername && data.group.members.includes(currentUsername)) {
          setGroups(prev => [data.group, ...prev]);
        }
      });

      socket.on('group:updated', (data) => {
        const currentUsername = userType === 'admin' ? 'admin' : currentUser?.username;
        if (currentUsername && data.group.members.includes(currentUsername)) {
          setGroups(prev =>
            prev.map(group =>
              group._id === data.group._id ? data.group : group
            )
          );
        }
      });

      // Handle profile updates for both admin and subadmin
      socket.on('admin:profileUpdated', (userData) => {
        if (userType === 'admin') {
          setCurrentUser(userData);
        }
      });

      socket.on('admin:profiledata', (userData) => {
        if (userType === 'admin') {
          setCurrentUser(userData);
        }
      });

      socket.on('subadmin:profileUpdated', (userData) => {
        if (userType === 'subadmin') {
          setCurrentUser(userData);
        }
      });

      socket.on('subadmin:profiledata', (userData) => {
        if (userType === 'subadmin') {
          setCurrentUser(userData);
        }
      });

      return () => {
        socket.off('groups:list');
        socket.off('group:created');
        socket.off('group:updated');
        socket.off('admin:profileUpdated');
        socket.off('admin:profiledata');
        socket.off('subadmin:profileUpdated');
        socket.off('subadmin:profiledata');
      };
    }
  }, [socket, isLoggedIn, userType, currentUser]);


  const handleSelectGroup = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedUser(null); // Clear selected user when selecting group
  };

  const handleSelectUser = (user) => {
    console.log('user in admin page', user)
    setSelectedUser(user);
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

  const handleProfileUpdate = (newProfilePicture) => {
    setCurrentUser(prev => ({
      ...prev,
      profilePicture: newProfilePicture
    }));
  };

 

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setUserType(null);
    setCurrentUser(null);
    if (userType === 'admin') {
      socket.emit('admin:logout');
    } else if (userType === 'subadmin') {
      const storedUsername = localStorage.getItem('subAdminUsername');
      socket.emit('subadmin:logout', storedUsername );
      localStorage.removeItem('subAdminUsername');
    }
  };

  const handleBackClick = () => {
    setShowChat(false);
    console.log("clicked back");
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  const handleLoginSuccess = (type, userData = null) => {
    setIsLoggedIn(true);
    setUserType(type);
    if (userData) {
      setCurrentUser(userData);
    }
  };

  if (loading) {
    return <ChatLoader />;
  }

  // Render both admin login and chat interface, but blur and disable chat when not logged in
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {!isLoggedIn && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
          <AdminLoginForm onSuccess={handleLoginSuccess} />
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
              currentUser={currentUser}
              users={users}
              onSelectUser={handleSelectUser}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              setIsLoggedIn={setIsLoggedIn}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              userToEdit={userToEdit}
              setUserToEdit={setUserToEdit}
              newUsername={newUsername}
              handleProfileUpdate={handleProfileUpdate}
              newPassword={newPassword}
              setNewUsername={setNewUsername}
              setNewPassword={setNewPassword}
              handleLogout={handleLogout}
              userType={userType}
            />
          ) : (
            <GroupsList
              groups={groups}
              onSelectGroup={handleSelectGroup}
              selectedGroup={selectedGroup}
              setIsLoggedIn={setIsLoggedIn}
              socket={socket}
              setCreateGroupOpen={setCreateGroupOpen}
              currentUser={userType === 'admin' ? 'admin' : currentUser?.username}

            />
          )}
        </div>

        {/* ChatInterface - Full width on mobile when showing chat */}
        <div className={`${isMobile && !showChat ? 'hidden' : 'w-full'} md:flex-1 overflow-hidden`}>
          <ChatInterface
            isAdmin={userType === 'admin'}
            isSubAdmin={userType === 'subadmin'}
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
            userType={userType}
            currentUser={currentUser}
            isBroadcast={selectedUser?.isBroadcast || false}
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