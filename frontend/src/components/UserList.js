
'use client';

import { useState, useEffect, use } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { toast } from "sonner";
import CreateUser from './CreateUser';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

export default function UsersList({ 
  users, 
  onSelectUser, 
  selectedUser, 
  setIsLoggedIn, 
  socket, 
  dialogOpen, 
  setDialogOpen, 
  userToEdit, 
  isEditMode, 
  newUsername,
  newPassword,
  setNewUsername,
  setNewPassword,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [sortedUsers, setSortedUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // Store unread counts for each user

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

  // Request unread counts when component mounts or when socket changes
  useEffect(() => {
    if (socket) {
      // Request unread counts for all users
      socket.emit('admin:getUnreadCounts');
      
      // Listen for unread counts updates
      socket.on('admin:unreadCounts', (counts) => {
        setUnreadCounts(counts);
      });

      // Listen for real-time unread count updates
      socket.on('admin:unreadCountUpdate', ({ username, count }) => {
        setUnreadCounts(prev => ({
          ...prev,
          [username]: count
        }));
      });

      // Clean up listeners
      return () => {
        socket.off('admin:unreadCounts');
        socket.off('admin:unreadCountUpdate');
      };
    }
  }, [socket]);

  // Request updated unread counts when a user is selected (to mark as read)
  useEffect(() => {
    if (selectedUser && socket) {
      // Small delay to allow backend to process markAsRead
      setTimeout(() => {
        socket.emit('admin:getUnreadCounts');
      }, 100);
    }
  }, [selectedUser, socket]);

  // Sort users by most recent message and apply filters
  useEffect(() => {
    // Merge users with unread counts
    const usersWithUnread = users.map(user => ({
      ...user,
      unreadCount: unreadCounts[user.username] || 0
    }));

    // First sort users by recent activity (newest message or online status first)
    const sorted = [...usersWithUnread].sort((a, b) => {
      // If a user has unread messages, they go to the top
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
  }, [users, unreadCounts, searchTerm, filter]);

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

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout');
  };

  const handleSelectUser = (username) => {
    onSelectUser(username);
    // Mark messages as read when admin selects a user
    if (socket) {
      socket.emit('messages:markRead', { sender: username, receiver: 'admin' });
    }
  };

  // Mobile menu component
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
            <h3 className="font-medium">Admin Panel</h3>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#009874]">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="flex flex-col space-y-2">
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
                onClick={() => setDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Add New User
              </Button>
            </SheetClose>
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
            <button
              onClick={() => setDialogOpen(true)}
              className="hover:bg-[#f0f2f5] rounded-full p-2 cursor-pointer hidden md:block"
              title="Add User"
            >
              <UserPlus className="h-5 w-5" />
            </button>
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
        <div className="hidden md:flex items-center justify-between mt-2">
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
          </div>

          <Button
            variant="default"
            size="sm"
            className="bg-[#00a884] hover:bg-[#009874]"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" /> Add User
          </Button>
        </div>
        
        {/* Mobile filters - simple text displays */}
        <div className="flex justify-between items-center mt-2 md:hidden">
          <div className="text-sm font-medium text-slate-600">
            {filter === 'all' ? 'All Users' : 'Unread Messages'}
          </div>
          {filter === 'unread' && totalUnreadMessages > 0 && (
            <Badge variant="default" className="bg-[#00a884]">
              {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)]">
          {sortedUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              {filter === 'unread' ? 'No unread messages' : 'No users available'}
            </div>
          ) : (
            <div>
              {sortedUsers.map((user) => (
                <div
                  key={user.username}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors relative ${
                    selectedUser === user.username ? 'bg-slate-100' : ''
                  } ${user.unreadCount > 0 ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                  onClick={() => handleSelectUser(user.username)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 bg-slate-200">
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
                        <p className={`text-sm font-medium truncate ${
                          user.unreadCount > 0 ? 'text-slate-900 font-semibold' : 'text-slate-900'
                        }`}>
                          {user.username}
                        </p>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                            (user.isOnline ? 'Now' : formatLastSeen(user.lastSeen))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs truncate pr-2 ${
                          user.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'
                        }`}>
                          {user.lastMessage ? user.lastMessage.substring(0, 30) + (user.lastMessage.length > 30 ? '...' : '') :
                            user.isOnline ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <Circle className="h-2 w-2 fill-green-500" /> Online
                              </span>
                            ) : (
                              `Last seen: ${formatLastSeen(user.lastSeen)}`
                            )
                          }
                        </p>

                        {user.unreadCount > 0 && (
                          <Badge 
                            variant="default" 
                            className="bg-green-600 hover:bg-green-600 text-white min-w-[20px] h-5 px-2 text-xs font-semibold rounded-full flex items-center justify-center"
                          >
                            {user.unreadCount > 99 ? '99+' : user.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <CreateUser
          socket={socket}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword} 
        />
      </Dialog>  
    </div>
  );
}