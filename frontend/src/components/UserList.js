
// //  version 2

// import { useState, useEffect } from 'react';
// import { Input } from '@/components/ui/input';
// import { 
//   Search, 
//   Circle,
//   User,
//   LogOut
// } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';

// export default function UsersList({ users, onSelectUser, selectedUser, setIsLoggedIn }) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filter, setFilter] = useState('all'); // 'all' or 'unread'
//   const [sortedUsers, setSortedUsers] = useState([]);

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

//         {/* Filter buttons */}
//         <div className="flex space-x-2 mt-2">
//           <Button 
//             variant={filter === 'all' ? "default" : "outline"} 
//             size="sm" 
//             className={filter === 'all' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
//             onClick={() => setFilter('all')}
//           >
//             All
//           </Button>
//           <Button 
//             variant={filter === 'unread' ? "default" : "outline"} 
//             size="sm" 
//             className={filter === 'unread' ? "bg-[#00a884] hover:bg-[#00a884]" : ""}
//             onClick={() => setFilter('unread')}
//           >
//             Unread
//             {users.reduce((count, user) => count + (user.unreadCount || 0), 0) > 0 && (
//               <Badge variant="outline" className="ml-1 bg-white text-[#00a884] border-white">
//                 {users.reduce((count, user) => count + (user.unreadCount || 0), 0)}
//               </Badge>
//             )}
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
//                   className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
//                     selectedUser === user.username ? 'bg-slate-100' : ''
//                   }`}
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
//                           {user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
//                            (user.isOnline ? 'Now' : formatLastSeen(user.lastSeen))}
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
//     </div>
//   );
// }



import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Search,
  Circle,
  User,
  LogOut,
  UserPlus,
  Copy
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
// import { toast } from '@/components/ui/use-toast';
import { toast } from "sonner"
import CreateUser from './CreateUser';


export default function UsersList({ users, onSelectUser, selectedUser, setIsLoggedIn, socket }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [sortedUsers, setSortedUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

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



  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            <span className="font-medium">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="hover:bg-[#9ad3c7] rounded-full p-2 cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
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

        {/* Filter buttons with Add User button */}
        <div className="flex items-center justify-between mt-2">
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

          <Button
            variant="default"
            size="sm"
            className="bg-[#00a884] hover:bg-[#009874]"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" /> Add User
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-220px)]">
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
                      <Avatar className="h-12 w-12 bg-slate-200">
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
          setNewPassword={setNewPassword} />
      </Dialog>

    </div>
  );
}