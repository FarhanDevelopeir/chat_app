


'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UserLogin from '@/components/UserLogin';
import ChatInterface from '@/components/ChatInterface';
import { MessageCircle, LogOut, User, ArrowLeft, ChevronRight } from 'lucide-react';
import ChatLoader from '@/components/ChatLoader';
import ProfileAvatar from '@/components/ProfileAvatar';
import { toast } from 'react-toastify';

export default function UserChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminOnline, setAdminOnline] = useState(false);
  const [subAdminOnline, setSubAdminOnline] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile view transitions
  const [isMobile, setIsMobile] = useState(false); // Track if we're on mobile
  const [currentUser, setCurrentUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const { socket } = useSocket();
  const [userGroups, setUserGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState('admin'); // null, 'admin', or groupId
  const [chatType, setChatType] = useState('user');

  const [unreadCounts, setUnreadCounts] = useState({});
  const [latestMessages, setLatestMessages] = useState({});
  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState();

  // Add this state variable at the top of UserChatPage component
  const [announcements, setAnnouncements] = useState([]);

  // Add these useEffect listeners in the existing useEffect where socket listeners are
  useEffect(() => {
    if (socket && isLoggedIn) {
      // ... existing socket listeners ...
      const username = localStorage.getItem('chat_username');

      // Add announcement listeners
      socket.on('user:announcements', (announcementsList) => {
        setAnnouncements(announcementsList);
      });

      socket.on('user:newAnnouncement', (announcement) => {
        setAnnouncements(prev => [announcement, ...prev]);
        toast.success('📢 New announcement received!');
      });

      socket.on('user:announcementDeleted', (deletedId) => {
        setAnnouncements(prev => prev.filter(ann => ann._id !== deletedId));
      });

      // **NEW: Listen for force reload (only for the specific user)**
      socket.on('user:forceReload', (data) => {
        if (data.targetUsername === username) {
          console.log("Your password has been updated by admin.");
          
          toast.warning('⚠️ Your password has been updated by admin. Page will reload in 3 seconds...');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });

      // Request initial announcements
      socket.emit('user:getAnnouncements', { username });

      return () => {
        // ... existing cleanup ...
        socket.off('user:announcements');
        socket.off('user:newAnnouncement');
        socket.off('user:announcementDeleted');
        socket.off('user:forceReload');

      };
    }
  }, [socket, isLoggedIn]);



  // Add this component for displaying announcements
  const AnnouncementBar = () => {
    // if (announcements.length === 0) return null;
    if (announcements.length === 0 || (isMobile && showChat)) return null;


    return (
      <div className="bg-green-50 border-b border-blue-200 ">
        {announcements.slice(0, 1).map((announcement) => (
          <div key={announcement._id} className="p-3">
            <marquee>
              <div className="flex items-start gap-2">
                <div className="text-green-600 mt-1">📢</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-800 mb-1">
                    Announcement from {announcement.createdBy}
                  </div>
                  <div className="text-sm text-green-700 whitespace-pre-wrap">
                    {announcement.text}
                  </div>
                  {/* <div className="text-xs text-blue-600 mt-1">
                {new Date(announcement.createdAt).toLocaleString()}
              </div> */}
                </div>
              </div>
            </marquee>
          </div>
        ))}
        {/* {announcements.length > 1 && (
        <div className="px-3 pb-2">
          <div className="text-xs text-blue-600 text-center">
            +{announcements.length - 1} more announcements
          </div>
        </div>
      )} */}
      </div>
    );
  };


  console.log('latestMessages', latestMessages)
  console.log('unreadCounts', unreadCounts)


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

      // Listen for latest message updates - FIXED event names
      socket.on('user:latestMessages', (messages) => {
        console.log('user latest messages', messages)
        setLatestMessages(messages);
      });

      // Listen for individual latest message updates
      socket.on('user:latestMessageUpdate', (data) => {
        setLatestMessages(prev => ({
          ...prev,
          ...data
        }));
      });

      // Listen for unread count updates - FIXED event names
      socket.on('user:unreadCounts', (counts) => {
        setUnreadCounts(counts);
      });

      // Listen for individual unread count updates
      socket.on('user:unreadCountUpdate', (data) => {
        console.log('Received unread count update:', data);
        setUnreadCounts(prev => ({
          ...prev,
          ...data
        }));
      });

      socket.on('groups:list', (groupsList) => {
        const filtered = groupsList.filter(g => g.members.includes(username));
        setUserGroups(filtered);
      });

      socket.on('user:subAdminsList', (subAdminsList) => {
        setSubAdmins(subAdminsList);
      })

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

      socket.on('user:PasswordChangedError', (error) => {
        setErrorMessage(error);
        toast.error(error)
        handleLogout()
      });

      // Request initial data
      socket.emit('user:getUnreadCounts', { username });
      socket.emit('user:getLatestMessages', { username });
      socket.emit('groups:fetch', { username });
      socket.emit('user:getSubAdmins', { username });

      return () => {
        socket.off('user:unreadCounts');
        socket.off('user:latestMessages');
        socket.off('user:unreadCountUpdate');
        socket.off('user:latestMessageUpdate');
        socket.off('user:groupsList');
        socket.off('user:subAdminsList');
        socket.off('user:groupUpdated');
        socket.off('group:created');
        socket.off('group:updated');
        socket.off('user:profileUpdated');
        socket.off('user:loginSuccess');
        socket.off('admin:profiledata');
        socket.off('user:PasswordChangedError');
      };
    }
  }, [socket, isLoggedIn]);

  useEffect(() => {
    if (socket && selectedChat && isLoggedIn) {
      const username = localStorage.getItem('chat_username');

      // Reset unread count when chat is selected
      if (selectedChat === 'admin') {
        socket.emit('user:markChatAsRead', {
          username,
          chatId: 'admin',
          chatType: 'admin'
        });
      } else if (chatType === 'group') {
        socket.emit('user:markChatAsRead', {
          username,
          chatId: selectedChat,
          chatType: 'group'
        });
      } else if (chatType === 'subadmin') {
        socket.emit('user:markChatAsRead', {
          username,
          chatId: selectedChat,
          chatType: 'subadmin'
        });
      }
    }
  }, [selectedChat, socket, isLoggedIn, chatType]);

  // for issue resolve
  useEffect(() => {
    if (!socket) return;

    // Listen for admin status
    socket.on('admin:status', (status) => {
      setAdminOnline(status.isOnline);
    });

    socket.on('subadmin:status', (status) => {
      setSubAdminOnline(status.isOnline);
    });

    // Request admin status on connection
    socket.emit('user:requestAdminStatus');

    return () => {
      socket.off('admin:status');
      socket.off('subadmin:status');
      socket.off('message:receive');
    };
  }, [socket]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('chat_username');
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



  const handleChatSelect = (type = 'admin', groupId = null, subAdmin = null) => {
    if (type === 'admin') {
      setSelectedChat('admin');
      setChatType('user');
    } else if (type === 'group' && groupId) {
      setSelectedChat(groupId);
      setChatType('group');
    } else if (type === 'subadmin' && subAdmin) {
      setSelectedChat(subAdmin?.username);
      setSelectedSubAdmin(subAdmin)
      setChatType('subadmin');
    }
    setShowChat(true);
  };

  const handleBackClick = () => {
    setShowChat(false);
  };

  return (

    <>
      <AnnouncementBar />
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



            {/* // Replace the Admin Support Chat section with this updated code: */}

            <div
              className={`cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center ${selectedChat === 'admin' ? 'bg-gray-100' : ''}`}
              onClick={() => handleChatSelect('admin')}
            >
              <div className="flex items-center flex-1">
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

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      Admin Support
                      <img
                        src="/blue-tick.png"
                        alt="Blue Tick"
                        className="w-4 h-4 md:w-5 md:h-5"
                      />
                    </p>
                    {Number(unreadCounts['admin']) > 0 && selectedChat !== 'admin' && (
                      <div className="bg-[#00a884] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCounts['admin']}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm text-gray-500 truncate overflow-hidden whitespace-nowrap max-w-[160px]"
                      title={(() => {
                        const latestMsg = latestMessages['admin'];
                        if (latestMsg) {
                          const isSelf = latestMsg.sender === localStorage.getItem('chat_username');
                          const prefix = isSelf ? 'You: ' : '';
                          const msgContent = latestMsg.content || '';

                          if (msgContent.includes("Document:")) return prefix + '📎 File';
                          if (msgContent.includes("Image:")) return prefix + '🖼️ Image';
                          if (msgContent.includes("Voice:")) return prefix + '🎵 Audio';

                          return prefix + msgContent;
                        }

                        return adminOnline ? 'Online' : 'Offline';
                      })()}
                    >
                      {latestMessages['admin'] ? (() => {
                        const latestMsg = latestMessages['admin'];
                        const isSelf = latestMsg.sender === localStorage.getItem('chat_username');
                        const prefix = isSelf ? 'You: ' : '';

                        let messageText = '';
                        const msgContent = latestMsg.content || '';

                        if (msgContent.includes("Document:")) {
                          messageText = '📎 File';
                        } else if (msgContent.includes("Image:")) {
                          messageText = '🖼️ Image';
                        } else if (msgContent.includes("Voice:")) {
                          messageText = '🎵 Audio';
                        } else {
                          messageText = msgContent;
                        }

                        const displayText = prefix + messageText;
                        return displayText.length > 20 ? displayText.substring(0, 20) + '...' : displayText;
                      })() : (adminOnline ? 'Online' : 'Offline')}
                    </p>
                    {latestMessages['admin'] && latestMessages['admin'].createdAt && (
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(latestMessages['admin'].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isMobile && (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {/* SubAdmin Chats */}
            {subAdmins?.map((subAdmin) => (
              <div
                key={subAdmin.username}
                className={`cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center ${selectedChat === subAdmin.username ? 'bg-gray-100' : ''}`}
                onClick={() => handleChatSelect('subadmin', null, subAdmin)}
              >
                <div className="flex items-center flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold overflow-hidden">
                      {subAdmin.profilePicture ? (
                        <img
                          src={subAdmin.profilePicture}
                          alt={`${subAdmin.username} profile picture`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        subAdmin.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    {subAdmin.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        {subAdmin.username}
                        <img
                          src="/blue-tick.png"
                          alt="Blue Tick"
                          className="w-4 h-4 md:w-5 md:h-5"
                        />
                      </p>
                      {Number(unreadCounts[subAdmin.username]) > 0 && selectedChat !== subAdmin.username && (
                        <div className="bg-[#00a884] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCounts[subAdmin.username]}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm text-gray-500 truncate overflow-hidden whitespace-nowrap max-w-[160px]"
                        title={(() => {
                          const latestMsg = latestMessages[subAdmin.username];
                          if (latestMsg) {
                            const isSelf = latestMsg.sender === localStorage.getItem('chat_username');
                            const prefix = isSelf ? 'You: ' : '';
                            const msgContent = latestMsg.content || '';

                            if (msgContent.includes("Document:")) return prefix + '📎 File';
                            if (msgContent.includes("Image:")) return prefix + '🖼️ Image';
                            if (msgContent.includes("Voice:")) return prefix + '🎵 Audio';

                            return prefix + msgContent;
                          }

                          return subAdmin.isOnline ? 'Online' : 'Offline';
                        })()}
                      >
                        {latestMessages[subAdmin.username] ? (() => {
                          const latestMsg = latestMessages[subAdmin.username];
                          const isSelf = latestMsg.sender === localStorage.getItem('chat_username');
                          const prefix = isSelf ? 'You: ' : '';

                          let messageText = '';
                          const msgContent = latestMsg.content || '';

                          if (msgContent.includes("Document:")) {
                            messageText = '📎 File';
                          } else if (msgContent.includes("Image:")) {
                            messageText = '🖼️ Image';
                          } else if (msgContent.includes("Voice:")) {
                            messageText = '🎵 Audio';
                          } else {
                            messageText = msgContent;
                          }

                          const displayText = prefix + messageText;
                          return displayText.length > 20 ? displayText.substring(0, 20) + '...' : displayText;
                        })() : (subAdmin.isOnline ? 'Online' : 'Offline')}
                      </p>
                      {latestMessages[subAdmin.username] && latestMessages[subAdmin.username].createdAt && (
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(latestMessages[subAdmin.username].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isMobile && (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
            ))}
            {/* // Updated User Groups mapping */}
            {userGroups.map((group) => (
              <div
                key={group._id}
                className={`cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center ${selectedChat === group._id ? 'bg-gray-100' : ''}`}
                onClick={() => handleChatSelect('group', group._id)}
              >
                <div className="flex items-center flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {group.name}
                      </p>
                      {unreadCounts[group._id] > 0 && (
                        <div className="bg-[#00a884] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCounts[group._id]}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm text-gray-500 truncate max-w-[160px]"
                        title={(() => {
                          const latestMsg = latestMessages[group._id];
                          if (latestMsg) {
                            const isSelf = latestMsg.sender === localStorage.getItem('chat_username');
                            const senderName = isSelf ? 'You' : latestMsg.sender;
                            const msgContent = latestMsg.content || '';

                            if (msgContent.includes("Document:")) return `${senderName}: 📎 File`;
                            if (msgContent.includes("Image:")) return `${senderName}: 🖼️ Image`;
                            if (msgContent.includes("Voice:")) return `${senderName}: 🎵 Audio`;

                            return `${senderName}: ${msgContent}`;
                          }

                          return `${group.members.length} members`;
                        })()}
                      >
                        {latestMessages[group._id] ? (() => {
                          const latestMsg = latestMessages[group._id];
                          const isSelf = latestMsg.sender === localStorage.getItem('chat_username');
                          const senderName = isSelf ? 'You' : latestMsg.sender;
                          const msgContent = latestMsg.content || '';

                          let messageText = '';
                          if (msgContent.includes("Document:")) {
                            messageText = '📎 File';
                          } else if (msgContent.includes("Image:")) {
                            messageText = '🖼️ Image';
                          } else if (msgContent.includes("Voice:")) {
                            messageText = '🎵 Audio';
                          } else {
                            messageText = msgContent;
                          }

                          const displayText = `${senderName}: ${messageText}`;
                          return displayText.length > 20 ? displayText.substring(0, 20) + '...' : displayText;
                        })() : `${group.members.length} members`}
                      </p>


                      {latestMessages[group._id] && (
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(latestMessages[group._id].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
            // selectedUser={chatType === 'user' ? 'admin' : null}
            selectedUser={chatType === 'user' ? 'admin' : chatType === 'subadmin' ? selectedChat : null}
            selectedGroup={chatType === 'group' ? selectedChat : null}
            chatType={chatType}
            groups={userGroups}
            admin={admin}
            subAdmin={selectedSubAdmin}
          />
        </div>
      </div>
    </>
  );
}