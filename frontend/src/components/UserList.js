
'use client';

import { useState, useEffect, use, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
  Search,
  Circle,
  User,
  LogOut,
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pin, PinOff } from 'lucide-react';
import { toast } from "sonner";
import CreateUser from './CreateUser';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle
} from "@/components/ui/sheet";
import ProfileAvatar from './ProfileAvatar';
import { useSocket } from '@/context/SocketContext';

export default function UsersList({
  socket,
  users,
  onSelectUser,
  selectedUser,
  setSelectedUser,
  setIsLoggedIn,
  currentUser,
  handleProfileUpdate,
  dialogOpen,
  setDialogOpen,
  userToEdit,
  setUserToEdit,
  newUsername,
  newPassword,
  setNewUsername,
  setNewPassword,
  handleLogout,
  adminOnline,
  userType
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [sortedUsers, setSortedUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // Store unread counts for each user
  const [matchingIPs, setMatchingIPs] = useState([]);
  const { latestMessages, setLatestMessages, formatMessageForDisplay } = useSocket();
  const currentUserRef = useRef(currentUser);
  const [pinnedChats, setPinnedChats] = useState([]);
  // Add these state variables at the top of UsersList component
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [manageAnnouncementsDialog, setManageAnnouncementsDialog] = useState(false);


  console.log('adminOnline in admin', adminOnline)

   console.log('users in admin', users)

  // Add these useEffect listeners
  useEffect(() => {
    if (socket) {
      // Listen for announcements updates
      socket.on('announcements:list', (announcementsList) => {
        setAnnouncements(announcementsList);
      });

      socket.on('announcement:created', (announcement) => {
        setAnnouncements(prev => [announcement, ...prev]);
        toast.success('Announcement created successfully!');
      });

      socket.on('announcement:deleted', (deletedId) => {
        setAnnouncements(prev => prev.filter(ann => ann._id !== deletedId));
        toast.success('Announcement deleted successfully!');
      });

      if (socket && userType === 'admin') {
        // Listen for subadmins list
        socket.on('admin:subAdminsList', (subAdminsList) => {
          setSubAdmins(subAdminsList);
        });
      }

      // Request initial announcements
      socket.emit('announcements:fetch', { userType });
      socket.emit('admin:getSubAdmins');

      return () => {
        socket.off('announcements:list');
        socket.off('admin:subAdminsList');
        socket.off('announcement:created');
        socket.off('announcement:deleted');
      };
    }
  }, [socket, userType]);

  // Add these handler functions
  const handleCreateAnnouncement = () => {
    if (!announcementText.trim()) {
      toast.error('Please enter announcement text');
      return;
    }

    socket.emit('announcement:create', {
      text: announcementText,
      createdBy: currentUser?.username,
      userType
    });

    setAnnouncementText('');
    setAnnouncementDialog(false);
  };

  const handleDeleteAnnouncement = (announcementId) => {
    socket.emit('announcement:delete', {
      announcementId,
      userType
    });
  };


  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('chat:getPinnedChats', {
        userType,
        currentUsername: currentUser?.username
      });
    }
  }, [socket, currentUser, userType]);

  // Check if viewing on mobile
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
    if (socket) {

      // Listen for unread counts updates
      socket.on('admin:unreadCounts', (counts) => {
        setUnreadCounts(counts);
      });

      socket.on('subadmin:unreadCounts', (counts) => {
        console.log('subadmin:unreadCounts', counts)
        setUnreadCounts(counts);
      });

      // Listen for real-time unread count updates
      socket.on('admin:unreadCountUpdate', ({ username, count }) => {
        setUnreadCounts(prev => ({
          ...prev,
          [username]: count
        }));
      });

      socket.on('subadmin:unreadCountUpdate', ({ username, count }) => {
        setUnreadCounts(prev => ({
          ...prev,
          [username]: count
        }));
      });

      // Listen for latest message updates - FIXED event names
      socket.on('admin:latestMessages', (messages) => {
        setLatestMessages(messages);
      });

      socket.on('subadmin:latestMessages', (messages) => {
        setLatestMessages(messages);
      });

      // Listen for individual latest message updates
      socket.on('admin:latestMessageUpdate', (data) => {
        setLatestMessages(prev => ({
          ...prev,
          ...data
        }));
      });

      socket.on('subadmin:latestMessageUpdate', (data) => {
        setLatestMessages(prev => ({
          ...prev,
          ...data
        }));
      });

      const handlePinnedChats = (data) => {
        setPinnedChats(data.pinnedChats || []);
      };

      const handleChatPinToggled = (data) => {
        setPinnedChats(data.pinnedChats || []);
      };

      socket.on('admin:pinnedChats', handlePinnedChats);
      socket.on('subadmin:pinnedChats', handlePinnedChats);
      socket.on('admin:chatPinToggled', handleChatPinToggled);
      socket.on('subadmin:chatPinToggled', handleChatPinToggled);

      // Clean up listeners
      return () => {
        socket.off('admin:unreadCounts');
        socket.off('subadmin:unreadCounts');
        socket.off('admin:unreadCountUpdate');
        socket.off('subadmin:unreadCountUpdate');
        socket.off('admin:latestMessages');
        socket.off('subadmin:latestMessages');
        socket.off('admin:latestMessageUpdate');
        socket.off('subadmin:latestMessageUpdate');
        socket.off('admin:pinnedChats', handlePinnedChats);
        socket.off('subadmin:pinnedChats', handlePinnedChats);
        socket.off('admin:chatPinToggled', handleChatPinToggled);
        socket.off('subadmin:chatPinToggled', handleChatPinToggled);
      };
    }
  }, [latestMessages]);


  useEffect(() => {
    if (socket) {
      if (userType === 'admin') {
        socket.emit('admin:getUnreadCounts');
        socket.emit('user:getLatestMessages', { username: 'admin' });
      } else if (userType === 'subadmin') {
        socket.emit('subadmin:getUnreadCounts', { username: currentUserRef.current?.username });
        socket.emit('user:getLatestMessages', { username: currentUserRef.current?.username });
      }
    }

  }, [socket, userType]);




  //   // Apply search filter
  //   let filtered = sorted.filter(user =>
  //     user.username.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  //   // Apply unread filter if selected
  //   if (filter === 'unread') {
  //     filtered = filtered.filter(user => user.unreadCount > 0);
  //   }

  //   setSortedUsers(filtered);
  // }, [users, unreadCounts, searchTerm, filter]);

  useEffect(() => {
    // Merge users with unread counts and pin status
    const usersWithUnread = users.map(user => ({
      ...user,
      unreadCount: unreadCounts[user.username] || 0,
      isPinned: pinnedChats.includes(user.username)
    }));

    // Sort users with pinned chats at the top
    const sorted = [...usersWithUnread].sort((a, b) => {
      // Pinned chats always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // If both are pinned or both are not pinned, apply existing sorting logic
      // If a user has unread messages, they go to the top (within their pin group)
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

      // If both have unread messages, sort by unread count (highest first)
      if (a.unreadCount > 0 && b.unreadCount > 0) {
        return b.unreadCount - a.unreadCount;
      }

      // If both have unread messages, sort by timestamp (if available)
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      }

      // If only one has a last message timestamp
      if (a.lastMessageTime && !b.lastMessageTime) return -1;
      if (!a.lastMessageTime && b.lastMessageTime) return 1;

      // Then by online status
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;

      // Finally by last seen
      if (a.lastSeen && b.lastSeen) {
        return new Date(b.lastSeen) - new Date(a.lastSeen);
      }

      return 0;
    });

    // Apply search filter
    let filtered = sorted.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply unread filter if selected
    if (filter === 'unread') {
      filtered = filtered.filter(user => user.unreadCount > 0);
    }

    setSortedUsers(filtered);
  }, [users, unreadCounts, searchTerm, filter, pinnedChats]);

  useEffect(() => {
    if (users && users.length > 0) {
      // Calculate matching IPs from users prop
      const ipGroups = {};
      users.forEach(user => {
        if (user.ipAddress) {
          if (!ipGroups[user.ipAddress]) {
            ipGroups[user.ipAddress] = [];
          }
          ipGroups[user.ipAddress].push(user.username);
        }
      });

      // Only keep IPs with multiple users
      const matches = Object.entries(ipGroups)
        .filter(([ip, usernames]) => usernames.length > 1)
        .map(([ip, usernames]) => ({ ip, users: usernames }));

      setMatchingIPs(matches);
    }
  }, [users]);

  // Calculate total unread messages
  const totalUnreadMessages = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const formatLastSeen = (date) => {
    if (!date) return 'Never';

    const lastSeen = new Date(date);
    const now = new Date();
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;

    return lastSeen.toLocaleDateString();
  };

  const handleTogglePin = (username, event) => {
    event.stopPropagation(); // Prevent user selection when clicking pin

    if (socket) {
      socket.emit('chat:togglePin', {
        targetUsername: username,
        userType,
        currentUsername: currentUser?.username
      });
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser(user);
    // Mark messages as read when admin selects a user
    if (socket) {
      socket.emit('messages:markRead', { sender: user?.username, receiver: userType === 'subadmin' ? currentUser?.username : 'admin' });
    }
  };

  const handleBroadcastSelect = () => {
    // Create a special broadcast user object
    const broadcastUser = {
      username: 'broadcast',
      isBroadcast: true,
      isOnline: true,
      profilePicture: null
    };
    onSelectUser(broadcastUser);
  };

  const handleSubAdminSelect = (subAdmin) => {
    // Set the user to edit with subadmin data
    setNewUsername(subAdmin.username);
    setNewPassword(''); // Keep password empty for editing
    setDialogOpen(true);

    // You might want to pass additional data to CreateUser component
    // Set edit mode and user data
    setIsEditMode(true);
    setUserToEdit(subAdmin);
  };

  // Mobile menu component
  // const MobileMenu = () => (
  //   <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
  //     <SheetTrigger asChild>
  //       <Button variant="ghost" size="icon" className="md:hidden relative">
  //         <Menu className="h-5 w-5" />
  //         {totalUnreadMessages > 0 && (
  //           <Badge
  //             variant="destructive"
  //             className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 hover:bg-red-500"
  //           >
  //             {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
  //           </Badge>
  //         )}
  //       </Button>
  //     </SheetTrigger>
  //     <SheetContent side="left" className="w-[240px] p-0">
  //       <div className="p-4 bg-[#00a884] text-white">
  //         <div className="flex justify-between items-center mb-2">
  //           <SheetTitle className="font-medium">Admin Panel</SheetTitle>
  //           <SheetClose asChild>
  //             <Button variant="ghost" size="icon" className="text-white hover:bg-[#009874]">
  //               <X className="h-5 w-5" />
  //             </Button>
  //           </SheetClose>
  //         </div>
  //       </div>
  //       <div className="px-4 py-2">
  //         <div className="flex flex-col space-y-2">
  //           <SheetClose asChild>
  //             <Button
  //               variant="ghost"
  //               className="justify-start"
  //               onClick={() => setFilter('all')}
  //             >
  //               All Users
  //             </Button>
  //           </SheetClose>
  //           <SheetClose asChild>
  //             <Button
  //               variant="ghost"
  //               className="justify-start"
  //               onClick={() => setFilter('unread')}
  //             >
  //               Unread Messages
  //               {totalUnreadMessages > 0 && (
  //                 <Badge variant="outline" className="ml-2 bg-[#00a884] text-white border-none">
  //                   {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
  //                 </Badge>
  //               )}
  //             </Button>
  //           </SheetClose>
  //           <SheetClose asChild>
  //             <Button
  //               variant="ghost"
  //               className="justify-start"
  //               onClick={() => setFilter('ips')}
  //             >
  //               User IPs
  //               {matchingIPs.length > 0 && (
  //                 <Badge variant="outline" className="ml-2 bg-red-500 text-white border-none">
  //                   {matchingIPs.length}
  //                 </Badge>
  //               )}
  //             </Button>
  //           </SheetClose>
  //           {userType === 'admin' && <SheetClose asChild>
  //             <Button
  //               variant="ghost"
  //               className="justify-start"
  //               onClick={() => setDialogOpen(true)}
  //             >
  //               <UserPlus className="h-4 w-4 mr-2" /> Add New User
  //             </Button>
  //           </SheetClose>}
  //           <div className="border-t border-gray-200 my-2"></div>
  //           <Button
  //             variant="ghost"
  //             className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
  //             onClick={handleLogout}
  //           >
  //             <LogOut className="h-4 w-4 mr-2" /> Logout
  //           </Button>
  //         </div>
  //       </div>
  //     </SheetContent>
  //   </Sheet>
  // );

  // Update the MobileMenu component in UsersList to include announcement buttons
  const MobileMenu = () => (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden relative">
          <Menu className="h-5 w-5" />
          {totalUnreadMessages > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 hover:bg-red-500"
            >
              {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <div className="p-4 bg-[#00a884] text-white">
          <div className="flex justify-between items-center mb-2">
            <SheetTitle className="font-medium">Admin Panel</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#009874]">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="flex flex-col space-y-2">
            {/* Existing menu items */}
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setFilter('all')}
              >
                All Users
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setFilter('unread')}
              >
                Unread Messages
                {totalUnreadMessages > 0 && (
                  <Badge variant="outline" className="ml-2 bg-[#00a884] text-white border-none">
                    {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                  </Badge>
                )}
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setFilter('ips')}
              >
                User IPs
                {matchingIPs.length > 0 && (
                  <Badge variant="outline" className="ml-2 bg-red-500 text-white border-none">
                    {matchingIPs.length}
                  </Badge>
                )}
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setFilter('broadcast')}
              >
                📢 Broadcast Message
              </Button>
            </SheetClose>

            {/* Announcement buttons */}
            <div className="border-t border-gray-200 my-2"></div>
            {userType === 'admin' && <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start text-blue-600"
                onClick={() => setAnnouncementDialog(true)}
              >
                📢 Create Announcement
              </Button>
            </SheetClose>}
            {userType === 'admin' && <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start text-purple-600"
                onClick={() => setManageAnnouncementsDialog(true)}
              >
                Manage Announcements
              </Button>
            </SheetClose>}

            {/* Add User button */}
            {userType === 'admin' && (
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Add New User
                </Button>
              </SheetClose>
            )}
            {userType === 'admin' && (
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setFilter('subadmins')}
                >
                  SubAdmins
                  {subAdmins.length > 0 && (
                    <Badge variant="outline" className="ml-2 bg-[#00a884] text-white border-none">
                      {subAdmins.length}
                    </Badge>
                  )}
                </Button>
              </SheetClose>
            )}
            <div className="border-t border-gray-200 my-2"></div>
            <Button
              variant="ghost"
              className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const renderIPsView = () => (
    <div className="p-4">
      <div className="space-y-4">
        {/* All Users with IPs */}
        <div>
          <h3 className="hidden md:visible text-sm font-semibold text-slate-700 mb-3">User IP Addresses</h3>
          <div className="space-y-2">
            {users.filter(user => user?.ipAddress).map((user) => (
              <div key={user.username} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8 bg-slate-200">
                      <AvatarImage
                        src={user.profilePicture || user.avatar}
                        alt={`${user.username}'s profile picture`}
                      />
                      <AvatarFallback className="bg-[#00a884] text-white text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">
                      {user.isOnline ? 'Online' : `Last seen: ${formatLastSeen(user.lastSeen)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-slate-700">{user.ipAddress}</p>
                  <p className="text-xs text-slate-500">IP Address</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matching IPs Section */}
        {matchingIPs.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
              <span className="h-2 w-2 bg-red-500 rounded-full"></span>
              Matching IP Addresses ({matchingIPs.length})
            </h3>
            <div className="space-y-3">
              {matchingIPs.map(({ ip, users: matchedUsers }, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-sm font-semibold text-red-800">{ip}</p>
                    <Badge variant="destructive" className="bg-red-500">
                      {matchedUsers.length} users
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedUsers.map(username => {
                      const user = users.find(u => u.username === username);
                      return (
                        <div key={username} className="flex items-center gap-2 bg-white p-2 rounded border">
                          <Avatar className="h-6 w-6 bg-slate-200">
                            <AvatarImage
                              src={user?.profilePicture || user?.avatar}
                              alt={`${username}'s profile picture`}
                            />
                            <AvatarFallback className="bg-[#00a884] text-white text-xs">
                              {username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-700">{username}</span>
                          {user?.isOnline && (
                            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubAdminsView = () => (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="hidden md:visible text-sm font-semibold text-slate-700 mb-3">SubAdmins Management</h3>
          <div className="space-y-2">
            {subAdmins.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No subadmins found
              </div>
            ) : (
              subAdmins.map((subAdmin) => (
                <div
                  key={subAdmin.username}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSubAdminSelect(subAdmin)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 bg-slate-200">
                        <AvatarImage
                          src={subAdmin.profilePicture || subAdmin.avatar}
                          alt={`${subAdmin.username}'s profile picture`}
                        />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {subAdmin.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {subAdmin.isOnline && (
                        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{subAdmin.username}</p>
                      <p className="text-xs text-slate-500">
                        {subAdmin.isOnline ? 'Online' : `Last seen: ${formatLastSeen(subAdmin.lastSeen)}`}
                      </p>
                      <p className="text-xs text-purple-600 font-medium">SubAdmin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Click to edit</p>
                    <p className="text-xs text-slate-500">
                      Created: {new Date(subAdmin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 md:p-4 border-b border-slate-200">
        <div className="mb-3 md:mb-4 flex justify-between items-center">
          <div className="flex items-center">
            {isMobile && <MobileMenu />}
            <User className="h-5 w-5 mr-2" />
            <span className="font-medium text-[#00a884]">Admin Panel</span>
            {totalUnreadMessages > 0 && !isMobile && (
              <Badge
                variant="destructive"
                className="ml-2 bg-red-500 hover:bg-red-500"
              >
                {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <ProfileAvatar
              user={currentUser}
              onProfileUpdate={handleProfileUpdate}
              socket={socket}
              {...(userType === 'admin' && { isAdmin: true })}
              {...(userType === 'subadmin' && { isSubAdmin: true })}
            />
            <button
              onClick={handleLogout}
              className="hover:bg-[#f0f2f5] rounded-full p-2 cursor-pointer hidden md:block"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            className="pl-8 bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter tabs - Hidden on mobile, handled by side menu instead */}
        <div className="hidden md:flex items-center justify-between mt-2 overflow-x-auto">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? "default" : "outline"}
              size="sm"
              className={filter === 'all' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? "default" : "outline"}
              size="sm"
              className={filter === 'unread' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
              onClick={() => setFilter('unread')}
            >
              Unread
              {totalUnreadMessages > 0 && (
                <Badge variant="outline" className="ml-1 bg-white text-[#00a884] border-white">
                  {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                </Badge>
              )}
            </Button>
            <Button
              variant={filter === 'ips' ? "default" : "outline"}
              size="sm"
              className={filter === 'ips' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
              onClick={() => setFilter('ips')}
            >
              User IPs
              {matchingIPs.length > 0 && (
                <Badge variant="outline" className="ml-1 bg-white text-red-500 border-white">
                  {matchingIPs.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={filter === 'broadcast' ? "default" : "outline"}
              size="sm"
              className={filter === 'broadcast' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
              onClick={() => setFilter('broadcast')}
            >
              📢 Broadcast
            </Button>
          </div>



          <div className="flex space-x-2">

            {userType === 'admin' && <Button
              variant="outline"
              size="sm"
              // className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
              className={filter === 'announcement' ? "bg-[#00a884] hover:bg-[#00a884] ml-2" : " ml-2"}
              onClick={() => {
                setFilter('announcement');
                setManageAnnouncementsDialog(true)
              }}

            >
              📢 Announcements
            </Button>}
            {userType === 'admin' && (
              <Button
                variant={filter === 'subadmins' ? "default" : "outline"}
                size="sm"
                className={filter === 'subadmins' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
                onClick={() => setFilter('subadmins')}
              >
                SubAdmins
                {subAdmins.length > 0 && (
                  <Badge variant="outline" className="ml-1 bg-white text-[#00a884] border-white">
                    {subAdmins.length}
                  </Badge>
                )}
              </Button>
            )}
            {userType === 'admin' && (
              <Button
                variant="default"
                size="sm"
                className="bg-[#00a884] hover:bg-[#009874]"
                // onClick={() => setDialogOpen(true)}
                onClick={() => {
                  setDialogOpen(true);
                  setUserToEdit(false);
                }}
              >
                <UserPlus className="h-4 w-4 mr-1" /> Add User
              </Button>
            )}
          </div>
        </div>

        {/* Mobile filters - simple text displays */}
        <div className="flex justify-between items-center mt-2 md:hidden">
          <div className="text-sm font-medium text-slate-600">
            {filter === 'all' ? 'All Users' :
              filter === 'ips' ? 'User IP Addresses' :
                filter === 'subadmins' ? 'SubAdmins' :
                  filter === 'broadcast' ? 'Broadcast Message' :
                    'Unread Messages'}
          </div>
          {filter === 'unread' && totalUnreadMessages > 0 && (
            <Badge variant="default" className="bg-[#00a884]">
              {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
            </Badge>
          )}
          {filter === 'ips' && matchingIPs.length > 0 && (
            <Badge variant="default" className="bg-red-500">
              {matchingIPs.length} matches
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)]">
          {filter === 'ips' ? (
            renderIPsView()
          ) : filter === 'subadmins' ? (
            renderSubAdminsView()
          ) : filter === 'broadcast' ? (
            // Broadcast view
            <div className="p-4">
              <div
                className="p-4 border-2 border-dashed border-[#00a884] rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
                onClick={handleBroadcastSelect}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-[#00a884] rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">📢</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#00a884]">Broadcast Message</p>
                    <p className="text-sm text-slate-600">Send message to all users</p>
                  </div>
                </div>
              </div>
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              {filter === 'unread' ? 'No unread messages' : 'No users available'}
            </div>
          ) : (
            <div>
              {sortedUsers.map((user) => (
                <div
                  key={user.username}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors relative ${selectedUser?.username === user.username ? 'bg-slate-100' : ''
                    } ${user.unreadCount > 0 ? 'bg-green-50 border-l-4 border-l-green-500' : ''} ${user?.isPinned ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 bg-slate-200">
                        <AvatarImage
                          src={user.profilePicture || user.avatar}
                          alt={`${user.username}'s profile picture`}
                        />
                        <AvatarFallback className="bg-[#00a884] text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm flex font-medium truncate ${user.unreadCount > 0 ? 'text-slate-900 font-semibold' : 'text-slate-900'
                            }`}>
                            {user.username} {user?.isSubAdmin || user.username == 'admin' ? 
                            <img 
                        src="/blue-tick.png"
                        alt="Blue Tick"
                        className="ml-2 w-4 h-4 md:w-5 md:h-5"
                      />
                            : '' } 
                          </p>
                          {user?.isPinned && (
                            <Pin className="h-3 w-3 text-blue-500 fill-blue-500" />
                          )}
                        </div>

                        <div className="relative flex items-center gap-2">
                          {/* Dropdown Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-200">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={(e) => handleTogglePin(user.username, e)}
                                className="cursor-pointer"
                              >
                                {user?.isPinned ? (
                                  <>
                                    <PinOff className="h-4 w-4 mr-2" />
                                    Unpin
                                  </>
                                ) : (
                                  <>
                                    <Pin className="h-4 w-4 mr-2" />
                                    Pin
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <div className="flex flex-col items-end">
                            {user.unreadCount > 0 && (
                              <Badge
                                variant="default"
                                className="bg-green-600 hover:bg-green-600 text-white min-w-[20px] h-5 px-2 text-xs font-semibold rounded-full flex items-center justify-center"
                              >
                                {user.unreadCount > 99 ? '99+' : user.unreadCount}
                              </Badge>
                            )}

                            <span className="text-xs text-slate-500 whitespace-nowrap mt-1">
                              {user.lastMessageTime
                                ? new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : user.isOnline
                                  ? 'Now'
                                  : formatLastSeen(user.lastSeen)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rest of your existing message preview code remains the same */}
                      
                      <p className={`text-xs truncate pr-2 max-w-[150px] ${user.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'
                          }`}>
                        {(() => { 
                          const latestMsg =  latestMessages[user.username] ||  (user?.username === 'admin' ? latestMessages['admin'] : null);;
                          if (latestMsg) {
                            const prefix = (latestMsg.sender === 'admin' || latestMsg.sender === currentUser?.username ) ? 'You: ' : '';
                            const content = latestMsg.content || '';

                            let messageText = '';
                            if (content.includes("Document:")) {
                              messageText = '📎 File';
                            } else if (content.includes("Image:")) {
                              messageText = '🖼️ Image';
                            } else if (content.includes("Voice:")) {
                              messageText = '🎵 Audio';
                            } else {
                              messageText = content;
                            }

                            const displayText = prefix + messageText;
                            return displayText.length > 20 ? displayText.substring(0, 20) + '...' : displayText;
                          }

                          if (user.isOnline) {
                            return (
                              <span className="flex items-center gap-1 text-green-600">
                                <Circle className="h-2 w-2 fill-green-500" /> Online
                              </span>
                            );
                          }
                          return `Last seen: ${formatLastSeen(user.lastSeen)}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Add User Dialog */}
      {userType === 'admin' && <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <CreateUser
          socket={socket}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          userToEdit={userToEdit}
          setUserToEdit={setUserToEdit}
          users={users}

        />
      </Dialog>}



      {/* / Add these dialogs before the closing div */}
      {/* Create Announcement Dialog */}
      <Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Create a broadcast announcement for all users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              placeholder="Enter your announcement message..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 text-right">
              {announcementText.length}/500 characters
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAnnouncement}
              className="bg-[#00a884] hover:bg-[#009874]"
            >
              📢 Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Announcements Dialog */}
      <Dialog open={manageAnnouncementsDialog} onOpenChange={setManageAnnouncementsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Announcements</DialogTitle>
            <DialogDescription>
              View and delete existing announcements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No announcements found
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-600">
                      By: {announcement.createdBy} • {new Date(announcement.createdAt).toLocaleString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {announcement.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700 border-green-600"
            onClick={() => setAnnouncementDialog(true)}
          >
            📢 Create New Announcement
          </Button>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageAnnouncementsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>






    </div>
  );
}