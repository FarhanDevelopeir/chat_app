// 'use client';

// import { useState, useEffect } from 'react';
// import { Input } from '@/components/ui/input';
// import {
//   Search,
//   Users,
//   LogOut,
//   UserPlus,
//   Menu,
//   X
// } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import {
//   Sheet,
//   SheetContent,
//   SheetTrigger,
//   SheetClose
// } from "@/components/ui/sheet";

// export default function GroupsList({ 
//   groups, 
//   onSelectGroup, 
//   selectedGroup, 
//   setIsLoggedIn, 
//   socket,
//   setCreateGroupOpen
// }) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortedGroups, setSortedGroups] = useState([]);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);


//   // Check if viewing on mobile
//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkIfMobile();
//     window.addEventListener('resize', checkIfMobile);
    
//     return () => {
//       window.removeEventListener('resize', checkIfMobile);
//     };
//   }, []);

//   // Sort and filter groups
//   useEffect(() => {
//     // Apply search filter
//     let filtered = groups.filter(group =>
//       group.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Sort by creation date (newest first)
//     filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     setSortedGroups(filtered);
//   }, [groups, searchTerm]);


//   const handleLogout = () => {
//     localStorage.removeItem('adminLoggedIn');
//     setIsLoggedIn(false);
//     socket.emit('admin:logout');
//   };

//   const handleSelectGroup = (groupId) => {
//     onSelectGroup(groupId);
//   };

//   // Mobile menu component
//   const MobileMenu = () => (
//     <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
//       <SheetTrigger asChild>
//         <Button variant="ghost" size="icon" className="md:hidden">
//           <Menu className="h-5 w-5" />
//         </Button>
//       </SheetTrigger>
//       <SheetContent side="left" className="w-[240px] p-0">
//         <div className="p-4 bg-[#00a884] text-white">
//           <div className="flex justify-between items-center mb-2">
//             <h3 className="font-medium">Groups Panel</h3>
//             <SheetClose asChild>
//               <Button variant="ghost" size="icon" className="text-white hover:bg-[#009874]">
//                 <X className="h-5 w-5" />
//               </Button>
//             </SheetClose>
//           </div>
//         </div>
//         <div className="px-4 py-2">
//           <div className="flex flex-col space-y-2">
//             <SheetClose asChild>
//               <Button 
//                 variant="ghost" 
//                 className="justify-start" 
//                 onClick={() => setCreateGroupOpen(true)}
//               >
//                 <UserPlus className="h-4 w-4 mr-2" /> Create Group
//               </Button>
//             </SheetClose>
//             <div className="border-t border-gray-200 my-2"></div>
//             <Button 
//               variant="ghost" 
//               className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
//               onClick={handleLogout}
//             >
//               <LogOut className="h-4 w-4 mr-2" /> Logout
//             </Button>
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );

//   return (
//     <div className="flex flex-col h-full bg-white">
//       <div className="p-3 md:p-4 border-b border-slate-200">
//         <div className="mb-3 md:mb-4 flex justify-between items-center">
//           <div className="flex items-center">
//             {isMobile && <MobileMenu />}
//             <Users className="h-5 w-5 mr-2" />
//             <span className="font-medium text-[#00a884]">Groups Panel</span>
//           </div>
//           <div className="flex items-center space-x-1">
//             <button
//               onClick={() => setCreateGroupOpen(true)}
//               className="hover:bg-[#f0f2f5] rounded-full p-2 cursor-pointer hidden md:block"
//               title="Create Group"
//             >
//               <UserPlus className="h-5 w-5" />
//             </button>
//             <button
//               onClick={handleLogout}
//               className="hover:bg-[#f0f2f5] rounded-full p-2 cursor-pointer hidden md:block"
//               title="Logout"
//             >
//               <LogOut className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="relative mb-3">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
//           <Input
//             placeholder="Search groups..."
//             className="pl-8 bg-slate-50"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="flex justify-between items-center mt-2">
//           <div className="text-sm font-medium text-slate-600">
//             All Groups ({sortedGroups.length})
//           </div>
//           <Button
//             variant="default"
//             size="sm"
//             className="bg-[#00a884] hover:bg-[#009874] hidden md:flex"
//             onClick={() => setCreateGroupOpen(true)}
//           >
//             <UserPlus className="h-4 w-4 mr-1" /> Create Group
//           </Button>
//         </div>
//       </div>

//       <div className="flex-1 overflow-hidden">
//         <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)]">
//           {sortedGroups.length === 0 ? (
//             <div className="p-4 text-center text-slate-500">
//               No groups available
//             </div>
//           ) : (
//             <div>
//               {sortedGroups.map((group) => (
//                 <div
//                   key={group._id}
//                   className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
//                     selectedGroup === group._id ? 'bg-slate-100' : ''
//                   }`}
//                   onClick={() => handleSelectGroup(group._id)}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="relative">
//                       <Avatar className="h-10 w-10 md:h-12 md:w-12 bg-slate-200">
//                         <AvatarFallback className="bg-[#00a884] text-white">
//                           <Users className="h-5 w-5" />
//                         </AvatarFallback>
//                       </Avatar>
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-baseline">
//                         <p className="text-sm font-medium truncate text-slate-900">
//                           {group.name}
//                         </p>
//                         <span className="text-xs text-slate-500 whitespace-nowrap">
//                           {new Date(group.createdAt).toLocaleDateString()}
//                         </span>
//                       </div>

//                       <div className="flex items-center justify-between mt-1">
//                         <p className="text-xs text-slate-500 truncate pr-2">
//                           {group.members.length} members
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ScrollArea>
//       </div>
//     </div>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Search,
  Users,
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
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

export default function GroupsList({ 
  groups, 
  onSelectGroup, 
  selectedGroup, 
  setIsLoggedIn, 
  socket,
  setCreateGroupOpen,
  currentUser // Add currentUser prop

}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedGroups, setSortedGroups] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per group
  const [lastMessageTime, setLastMessageTime] = useState({}); // Track last message time per group

  // Check if viewing on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

 
// Updated useEffect for socket event listeners
useEffect(() => {
  if (!socket) return;

  // Listen for new group messages
  const handleGroupMessage = (message) => {
    const groupId = message.groupId;
    
    // Don't count messages from current user as unread
    if (message.sender !== currentUser) {
      setUnreadCounts(prev => ({
        ...prev,
        [groupId]: (prev[groupId] || 0) + 1
      }));
    }
    
    // Update last message time for sorting - this will trigger re-sorting
    setLastMessageTime(prev => ({
      ...prev,
      [groupId]: new Date(message.createdAt || Date.now())
    }));
  };

  // Listen for read status updates
  const handleReadStatusUpdate = (data) => {
    if (data.readBy === currentUser) {
      setUnreadCounts(prev => ({
        ...prev,
        [data.groupId]: 0
      }));
    }
  };

  // Listen for updated groups list from server
  const handleGroupsListUpdated = (groupsData) => {
    // Update unread counts and last message times from server data
    const counts = {};
    const times = {};
    
    groupsData.forEach(group => {
      counts[group._id] = group.unreadCount || 0;
      times[group._id] = group.lastMessageTime ? new Date(group.lastMessageTime) : new Date(group.createdAt);
    });
    
    setUnreadCounts(counts);
    setLastMessageTime(times);
  };

  socket.on('group:messageReceive', handleGroupMessage);
  socket.on('group:readStatusUpdate', handleReadStatusUpdate);
  socket.on('groups:listUpdated', handleGroupsListUpdated);

  return () => {
    socket.off('group:messageReceive', handleGroupMessage);
    socket.off('group:readStatusUpdate', handleReadStatusUpdate);
    socket.off('groups:listUpdated', handleGroupsListUpdated);
  };
}, [socket, currentUser]);

  // Sort and filter groups
  useEffect(() => {
    // Apply search filter
    let filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by last message time (most recent first), then by creation date
    filtered.sort((a, b) => {
      const aLastMessage = lastMessageTime[a._id] || new Date(a.createdAt);
      const bLastMessage = lastMessageTime[b._id] || new Date(b.createdAt);
      return new Date(bLastMessage) - new Date(aLastMessage);
    });

    setSortedGroups(filtered);
  }, [groups, searchTerm, lastMessageTime]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout');
  };

 // Updated handleSelectGroup function
const handleSelectGroup = (groupId) => {
  // Clear unread count immediately for better UX
  setUnreadCounts(prev => ({
    ...prev,
    [groupId]: 0
  }));
  
  // Emit mark as read event to server
  if (socket && currentUser) {
    socket.emit('group:markRead', {
      groupId,
      userId: currentUser
    });
  }
  
  onSelectGroup(groupId);
};
  // Mobile menu component
  const MobileMenu = () => (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <div className="p-4 bg-[#00a884] text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Groups Panel</h3>
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
                onClick={() => setCreateGroupOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Create Group
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
            <Users className="h-5 w-5 mr-2" />
            <span className="font-medium text-[#00a884]">Groups Panel</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCreateGroupOpen(true)}
              className="hover:bg-[#f0f2f5] rounded-full p-2 cursor-pointer hidden md:block"
              title="Create Group"
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
            placeholder="Search groups..."
            className="pl-8 bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="text-sm font-medium text-slate-600">
            All Groups ({sortedGroups.length})
          </div>
          <Button
            variant="default"
            size="sm"
            className="bg-[#00a884] hover:bg-[#009874] hidden md:flex"
            onClick={() => setCreateGroupOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" /> Create Group
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)]">
          {sortedGroups.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No groups available
            </div>
          ) : (
            <div>
              {sortedGroups.map((group) => {
                const unreadCount = unreadCounts[group._id] || 0;
                const isSelected = selectedGroup === group._id;
                
                return (
                  <div
                    key={group._id}
                    className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-100' : ''
                    }`}
                    onClick={() => handleSelectGroup(group._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 bg-slate-200">
                          <AvatarFallback className="bg-[#00a884] text-white">
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className={`text-sm truncate ${
                            unreadCount > 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-900'
                          }`}>
                            {group.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {new Date(
                                lastMessageTime[group._id] || group.createdAt
                              ).toLocaleDateString()}
                            </span>
                            {unreadCount > 0 && (
                              <Badge 
                                variant="default" 
                                className="bg-[#00a884] hover:bg-[#009874] text-white text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full"
                              >
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-slate-500 truncate pr-2">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}