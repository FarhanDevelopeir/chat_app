// // This is a Next.js page component for the admin chat interface.


// //  version 2

// import { useState, useEffect } from 'react';
// import { Input } from '@/components/ui/input';
// import {
//   Search,
//   Circle,
//   User,
//   LogOut,
//   UserPlus
// } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription
// } from '@/components/ui/dialog';
// // import { toast } from '@/components/ui/use-toast';
// import { toast } from "sonner"
// import CreateUser from './CreateUser';

// export default function UsersList({ users, onSelectUser, selectedUser, setIsLoggedIn, socket, dialogOpen, setDialogOpen, userToEdit, 
//   isEditMode, 
//   newUsername,
//             newPassword,
//             setNewUsername,
//             setNewPassword,

// }) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filter, setFilter] = useState('all'); // 'all' or 'unread'
//   const [sortedUsers, setSortedUsers] = useState([]);
//   // const [dialogOpen, setDialogOpen] = useState(false);


//   // Sort users by most recent message and apply filters
//   useEffect(() => {
//     // First sort users by recent activity (newest message or online status first)
//     const sorted = [...users].sort((a, b) => {
//       // If a user has unread messages, they go to the top
//       if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
//       if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

//       // If both have unread messages, sort by timestamp (if available)
//       if (a.lastMessageTime && b.lastMessageTime) {
//         return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
//       }

//       // If only one has a last message timestamp
//       if (a.lastMessageTime && !b.lastMessageTime) return -1;
//       if (!a.lastMessageTime && b.lastMessageTime) return 1;

//       // Then by online status
//       if (a.isOnline && !b.isOnline) return -1;
//       if (!a.isOnline && b.isOnline) return 1;

//       // Finally by last seen
//       if (a.lastSeen && b.lastSeen) {
//         return new Date(b.lastSeen) - new Date(a.lastSeen);
//       }

//       return 0;
//     });

//     // Apply search filter
//     let filtered = sorted.filter(user =>
//       user.username.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Apply unread filter if selected
//     if (filter === 'unread') {
//       filtered = filtered.filter(user => user.unreadCount > 0);
//     }

//     setSortedUsers(filtered);
//   }, [users, searchTerm, filter]);

//   const formatLastSeen = (date) => {
//     if (!date) return 'Never';

//     const lastSeen = new Date(date);
//     const now = new Date();
//     const diffMs = now - lastSeen;
//     const diffMins = Math.floor(diffMs / 60000);

//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins} mins ago`;

//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours < 24) return `${diffHours} hours ago`;

//     const diffDays = Math.floor(diffHours / 24);
//     if (diffDays < 7) return `${diffDays} days ago`;

//     return lastSeen.toLocaleDateString();
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('adminLoggedIn');
//     setIsLoggedIn(false);
//     socket.emit('admin:logout');
//   };

//   return (
//     <div className="flex flex-col h-full bg-white">
//       <div className="p-4 border-b border-slate-200">
//         <div className="mb-4 flex justify-between items-center">
//           <div className="flex items-center">
//             <User className="h-5 w-5 mr-2" />
//             <span className="font-medium">Admin</span>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="hover:bg-[#9ad3c7] rounded-full p-2 cursor-pointer"
//             title="Logout"
//           >
//             <LogOut className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="relative mb-3">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
//           <Input
//             placeholder="Search users..."
//             className="pl-8 bg-slate-50"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>



//         <div className="flex items-center justify-between mt-2">
//           <div className="flex space-x-2">
//             <Button
//               variant={filter === 'all' ? "default" : "outline"}
//               size="sm"
//               className={filter === 'all' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
//               onClick={() => setFilter('all')}
//             >
//               All
//             </Button>
//             <Button
//               variant={filter === 'unread' ? "default" : "outline"}
//               size="sm"
//               className={filter === 'unread' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
//               onClick={() => setFilter('unread')}
//             >
//               Unread
//               {users.reduce((count, user) => count + (user.unreadCount || 0), 0) > 0 && (
//                 <Badge variant="outline" className="ml-1 bg-white text-[#00a884] border-white">
//                   {users.reduce((count, user) => count + (user.unreadCount || 0), 0)}
//                 </Badge>
//               )}
//             </Button>
//           </div>

//           <Button
//             variant="default"
//             size="sm"
//             className="bg-[#00a884] hover:bg-[#009874]"
//             onClick={() => setDialogOpen(true)}
//           >
//             <UserPlus className="h-4 w-4 mr-1" /> Add User
//           </Button>
//         </div>
//       </div>

//       <div className="flex-1 overflow-hidden">
//         <ScrollArea className="h-[calc(100vh-220px)]">
//           {sortedUsers.length === 0 ? (
//             <div className="p-4 text-center text-slate-500">
//               {filter === 'unread' ? 'No unread messages' : 'No users available'}
//             </div>
//           ) : (
//             <div>
//               {sortedUsers.map((user) => (
//                 <div
//                   key={user.username}
//                   className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${selectedUser === user.username ? 'bg-slate-100' : ''
//                     }`}
//                   onClick={() => onSelectUser(user.username)}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="relative">
//                       <Avatar className="h-12 w-12 bg-slate-200">
//                         <AvatarFallback className="bg-[#00a884] text-white">
//                           {user.username.charAt(0).toUpperCase()}
//                         </AvatarFallback>
//                       </Avatar>
//                       {user.isOnline && (
//                         <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
//                       )}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-baseline">
//                         <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
//                         <span className="text-xs text-slate-500 whitespace-nowrap">
//                           {user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
//                             (user.isOnline ? 'Now' : formatLastSeen(user.lastSeen))}
//                         </span>
//                       </div>

//                       <div className="flex items-center mt-1">
//                         <p className="text-xs text-slate-500 truncate">
//                           {user.lastMessage ? user.lastMessage.substring(0, 30) + (user.lastMessage.length > 30 ? '...' : '') :
//                             user.isOnline ? (
//                               <span className="flex items-center gap-1 text-green-600">
//                                 <Circle className="h-2 w-2 fill-green-500" /> Online
//                               </span>
//                             ) : (
//                               `Last seen: ${formatLastSeen(user.lastSeen)}`
//                             )
//                           }
//                         </p>

//                         {user.unreadCount > 0 && (
//                           <Badge variant="default" className="ml-auto bg-green-600 hover:bg-green-600">
//                             {user.unreadCount}
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ScrollArea>
//       </div>

//       {/* Add User Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <CreateUser
//           socket={socket}
//           dialogOpen={dialogOpen}
//           setDialogOpen={setDialogOpen}
//           newUsername={newUsername}
//           setNewUsername={setNewUsername}
//           newPassword={newPassword}
//           setNewPassword={setNewPassword} 
//           // isEditMode={isEditMode}
//           // userToEdit={userToEdit}
//           />

//       </Dialog> 
//     </div>
//   );
// }


// implement responsive design for the chat interface and user list
import { useState, useEffect } from 'react';
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
// add code for group chat
import { Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';


export default function UsersList({
  socket,
  users,
  onSelectUser,
  selectedUser,
  setIsLoggedIn,
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
  // add code for group chat
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
  const [groupName, setGroupName] = useState('');

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

  // Sort users by most recent message and apply filters
  useEffect(() => {
    // First sort users by recent activity (newest message or online status first)
    const sorted = [...users].sort((a, b) => {
      // If a user has unread messages, they go to the top
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

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
  }, [users, searchTerm, filter]);

  // Add this useEffect in your UsersList component after your existing useEffects
  useEffect(() => {
    if (!socket) return;
    console.log('Socket connected:', socket);
    

    // Listen for group creation response
    socket.on('admin:groupCreated', (response) => {
      console.log('Group creation response:', response);
      
      if (response.success) {
        toast.success(response.message);
        console.log('Group created successfully:', response.group);
        
      } else {
        toast.error(response.message);
      }
    });

    return () => {
      socket.off('admin:groupCreated');
    };
  }, [socket]);

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


  // add code for group chat
  // Add this function after your existing functions
  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUsersForGroup.length === 0) {
      toast.error('Please provide group name and select at least one user');
      return;
    }

    console.log('Creating group:', groupName, selectedUsersForGroup);


    socket.emit('admin:createGroup', {
      groupName: groupName.trim(),
      members: selectedUsersForGroup
    });

    // Reset form
    setGroupName('');
    setSelectedUsersForGroup([]);
    setGroupDialogOpen(false);
  };

  const toggleUserSelection = (username) => {
    setSelectedUsersForGroup(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
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
            <h3 className="font-medium">Admin Panel</h3>
            {/* <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#009874]">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose> */}
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
                {users.reduce((count, user) => count + (user.unreadCount || 0), 0) > 0 && (
                  <Badge variant="outline" className="ml-2 bg-[#00a884] text-white border-none">
                    {users.reduce((count, user) => count + (user.unreadCount || 0), 0)}
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
            {/* add code for group chat */}
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setGroupDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" /> New Group
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
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setDialogOpen(true)}
              className="hover:bg-[#f0f2f5] rounded-full p-2 cursor-pointer hidden md:block"
              title="Add User"
            >
              <UserPlus className="h-5 w-5" />
            </button>
            {/* add code for group chat */}
            <button
              onClick={() => setGroupDialogOpen(true)}
              className="hover:bg-[#f0f2f5] rounded-full p-2 cursor-pointer hidden md:block"
              title="New Group"
            >
              <Users className="h-5 w-5" />
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
              {users.reduce((count, user) => count + (user.unreadCount || 0), 0) > 0 && (
                <Badge variant="outline" className="ml-1 bg-white text-[#00a884] border-white">
                  {users.reduce((count, user) => count + (user.unreadCount || 0), 0)}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex space-x-2">

          <Button
            variant="default"
            size="sm"
            className="bg-[#00a884] hover:bg-[#009874] text-xs "
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" /> Add User
          </Button>
          {/* add code for group chat */}
          <Button
            variant="default"
            size="sm"
            className="bg-[#00a884] hover:bg-[#009874] text-xs "
            onClick={() => setGroupDialogOpen(true)}
          >
            <Users className="h-4 w-4 mr-1" /> New Group
          </Button>
          </div>
        </div>

        {/* Mobile filters - simple text displays */}
        <div className="flex justify-between items-center mt-2 md:hidden">
          <div className="text-sm font-medium text-slate-600">
            {filter === 'all' ? 'All Users' : 'Unread Messages'}
          </div>
          {filter === 'unread' && users.reduce((count, user) => count + (user.unreadCount || 0), 0) > 0 && (
            <Badge variant="default" className="bg-[#00a884]">
              {users.reduce((count, user) => count + (user.unreadCount || 0), 0)}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)] ">
          {sortedUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              {filter === 'unread' ? 'No unread messages' : 'No users available'}
            </div>
          ) : (
            <div>
              {sortedUsers.map((user) => (
                <div
                  key={user.username}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${selectedUser === user.username ? 'bg-slate-100' : ''
                    }`}
                  onClick={() => onSelectUser(user.username)}
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
                        <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                            (user.isOnline ? 'Now' : formatLastSeen(user.lastSeen))}
                        </span>
                      </div>

                      <div className="flex items-center mt-1">
                        <p className="text-xs text-slate-500 truncate">
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
                          <Badge variant="default" className="ml-auto bg-green-600 hover:bg-green-600">
                            {user.unreadCount}
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

      {/* Group Chat Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Select users to add to the group and provide a group name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Select Members</label>
              {/* <ScrollArea className="max-h-60 mt-2 "> */}
              <ScrollArea className="h-72">
                {users.map((user) => (
                  <div key={user.username} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={user.username}
                      checked={selectedUsersForGroup.includes(user.username)}
                      onCheckedChange={() => toggleUserSelection(user.username)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#00a884] text-white text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.username}</span>
                      {user.isOnline && (
                        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="text-xs text-gray-500">
              {selectedUsersForGroup.length} user(s) selected
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsersForGroup.length === 0}
              className="bg-[#00a884] hover:bg-[#009874]"
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}