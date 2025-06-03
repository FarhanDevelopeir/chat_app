


'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UserLogin from '@/components/UserLogin';
import ChatInterface from '@/components/ChatInterface';
import { MessageCircle, LogOut, User, ArrowLeft, ChevronRight } from 'lucide-react';
import ChatLoader from '@/components/ChatLoader';
import ProfileAvatar from '@/components/ProfileAvatar';

export default function UserChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminOnline, setAdminOnline] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile view transitions
  const [isMobile, setIsMobile] = useState(false); // Track if we're on mobile
  const [currentUser, setCurrentUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const { socket } = useSocket();
  const [userGroups, setUserGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState('admin'); // null, 'admin', or groupId
  const [chatType, setChatType] = useState('user');

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

  useEffect(() => {
    // Check if user is already logged in
    const username = localStorage.getItem('chat_username');
    const deviceId = localStorage.getItem('chat_device_id');

    if (username && deviceId) {
      setIsLoggedIn(true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (socket && isLoggedIn) {
      const username = localStorage.getItem('chat_username');

      console.log('in here')

      // Fetch user's groups on login
      socket.emit('groups:fetch', { username });

      // Listen for groups list
      socket.on('groups:list', (groupsList) => {
        const filtered = groupsList.filter(g => g.members.includes(username));
        setUserGroups(filtered);
      });

      // Listen for new group additions
      socket.on('user:groupUpdated', (newGroup) => {
        setUserGroups(prev => {
          const exists = prev.some(group => group._id === newGroup._id);
          if (!exists) {
            return [...prev, newGroup];
          }
          return prev;
        });
      });

      socket.on('group:created', (data) => {
        socket.emit('groups:fetch', { username });
        console.log(data.message);
      });

      socket.on('group:updated', (data) => {
        socket.emit('groups:fetch', { username });
      });

      socket.on('user:profileUpdated', (userData) => {
        if (userData.username === username) {
          setCurrentUser(userData);
        }
      });

      // Listen for login success to get user data
      socket.on('user:loginSuccess', ({ user }) => {
        setCurrentUser(user);
      });

      socket.on('admin:profiledata', (userData) => {
        setAdmin(userData);
      });

      return () => {
        socket.off('user:groupsList');
        socket.off('user:groupUpdated');
        socket.off('group:created');
        socket.off('group:updated');
        socket.off('user:profileUpdated');
        socket.off('user:loginSuccess');
        socket.off('admin:profiledata');
      };
    }
  }, [socket, isLoggedIn]);

  // for issue resolve
  useEffect(() => {
    if (!socket) return;

    // Listen for admin status
    socket.on('admin:status', (status) => {
      setAdminOnline(status.isOnline);
    });

    // Request admin status on connection
    socket.emit('user:requestAdminStatus');

    // Listen for new messages - Remove mobile-specific filtering
    socket.on('message:receive', (message) => {
      // Just log the message, don't filter based on mobile state
      if (message.sender === 'admin') {
        console.log('New message received from admin');
        // You can add notification badge logic here if needed
      }
    });

    return () => {
      socket.off('admin:status');
      socket.off('message:receive');
    };
  }, [socket]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    // Keep deviceId for future recognition
    setIsLoggedIn(false);
    socket.emit('user:logout'); // Notify server about logout
    setShowChat(false); // Reset mobile view
  };

  const handleProfileUpdate = (newProfilePicture) => {
    setCurrentUser(prev => ({
      ...prev,
      profilePicture: newProfilePicture
    }));
  };

  if (loading) {
    return <ChatLoader />;
  }

  const handleChatSelect = (type = 'admin', groupId = null) => {
    if (type === 'admin') {
      setSelectedChat('admin');
      setChatType('user');
    } else if (type === 'group' && groupId) {
      setSelectedChat(groupId);
      setChatType('group');
    }
    setShowChat(true);
  };

  const handleBackClick = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      {!isLoggedIn && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
          <UserLogin onSuccess={() => setIsLoggedIn(true)} />
        </div>
      )}

      {/* Sidebar - Hidden on mobile when chat is showing */}
      <div className={`${isMobile && showChat ? 'hidden' : 'w-full md:w-1/4'} bg-white h-full flex flex-col`}>
        {/* Header */}
        <div className="bg-[#008069] text-white p-3 flex justify-between items-center sticky top-0 z-10">
          <div className="text-lg font-medium">WhatsApp</div>
          <div className="flex items-center space-x-2">
            <ProfileAvatar
              user={currentUser}
              onProfileUpdate={handleProfileUpdate}
              socket={socket}
            />
            <button
              onClick={handleLogout}
              className="text-white p-1.5 rounded-full"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Admin Support Chat */}
          <div
            className={`cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center ${selectedChat === 'admin' ? 'bg-gray-100' : ''
              }`}
            onClick={() => handleChatSelect('admin')}
          >
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold overflow-hidden">
                  {admin?.profilePicture ? (
                    <img
                      src={admin?.profilePicture}
                      alt="Admin profile picture"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    "A"
                  )}
                </div>
                {adminOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  Admin Support
                  <img
                    src="/blue-tick.png"
                    alt="Blue Tick"
                    className="w-4 h-4 md:w-5 md:h-5"
                  />
                </p>
                <p className="text-sm text-gray-500">
                  {adminOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Mobile only arrow */}
            {isMobile && (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* User Groups */}
          {userGroups.map((group) => (
            <div
              key={group._id}
              className={`cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center ${selectedChat === group._id ? 'bg-gray-100' : ''
                }`}
              onClick={() => handleChatSelect('group', group._id)}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {group.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {group.members.length} members
                  </p>
                </div>
              </div>

              {/* Mobile only arrow */}
              {isMobile && (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          ))}
        </div>

        {/* Empty state for mobile */}
        {isMobile && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#f0f2f5]">
            <div className="bg-white p-5 rounded-lg shadow-sm text-center max-w-xs">
              <h3 className="font-medium text-lg mb-2">Welcome to WhatsApp Chat</h3>
              <p className="text-gray-600 mb-4">
                Tap on the Admin chat to start your conversation
              </p>
              <div className="w-16 h-16 rounded-full bg-[#00a884] flex items-center justify-center mx-auto text-white text-2xl font-bold">
                A
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`${isMobile && !showChat ? 'hidden' : 'w-full'} md:flex-1 flex flex-col`}>
        <ChatInterface
          onBackClick={isMobile ? handleBackClick : null}
          selectedUser={chatType === 'user' ? 'admin' : null}
          selectedGroup={chatType === 'group' ? selectedChat : null}
          chatType={chatType}
          groups={userGroups}
          admin={admin}
        />
      </div>
    </div>
  );
}