// 'use client';

// import { useState, useEffect } from 'react';

// export default function UsersList({ users, onSelectUser, selectedUser }) {
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
  
//   return (
//     <div className="w-full h-full bg-white border-r border-gray-200">
//       <div className="p-4 border-b border-gray-200">
//         <h2 className="text-xl font-semibold text-gray-800">Users</h2>
//       </div>
      
//       <div className="overflow-y-auto h-[calc(100vh-64px)]">
//         {users.length === 0 ? (
//           <div className="p-4 text-center text-gray-500">No users available</div>
//         ) : (
//           <ul>
//             {users.map((user) => (
//               <li
//                 key={user.username}
//                 className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
//                   selectedUser === user.username ? 'bg-gray-100' : ''
//                 }`}
//                 onClick={() => onSelectUser(user.username)}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0">
//                       <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
//                         {user.username.charAt(0).toUpperCase()}
//                       </div>
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm font-medium text-gray-900">{user.username}</p>
//                       <p className="text-xs text-gray-500">
//                         {user.isOnline ? (
//                           <span className="text-green-500">Online</span>
//                         ) : (
//                           `Last seen: ${formatLastSeen(user.lastSeen)}`
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                   {user.isOnline && (
//                     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                   )}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

// version 2

// 'use client';

// import { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { 
//   Search, 
//   CircleUser,
//   Circle
// } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// export default function UsersList({ users, onSelectUser, selectedUser }) {
//   const [searchTerm, setSearchTerm] = useState('');
  
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

//   const filteredUsers = users.filter(user => 
//     user.username.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   return (
//     <div className="flex flex-col h-full bg-white">
//       <div className="p-4 border-b border-slate-200">
//         <h2 className="text-lg font-semibold text-slate-800 mb-4">Active Conversations</h2>
//         <div className="relative">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
//           <Input
//             placeholder="Search users..."
//             className="pl-8 bg-slate-50"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>
      
//       <ScrollArea className="flex-1">
//         {filteredUsers.length === 0 ? (
//           <div className="p-4 text-center text-slate-500">No users available</div>
//         ) : (
//           <div>
//             {filteredUsers.map((user) => (
//               <div
//                 key={user.username}
//                 className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
//                   selectedUser === user.username ? 'bg-slate-100' : ''
//                 }`}
//                 onClick={() => onSelectUser(user.username)}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="relative">
//                     <Avatar className="h-12 w-12 bg-slate-200">
//                       <AvatarFallback className="bg-indigo-600 text-white">
//                         {user.username.charAt(0).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                     {user.isOnline && (
//                       <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
//                     )}
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <div className="flex justify-between items-baseline">
//                       <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
//                       <span className="text-xs text-slate-500 whitespace-nowrap">
//                         {user.isOnline ? 'Now' : formatLastSeen(user.lastSeen)}
//                       </span>
//                     </div>
                    
//                     <div className="flex items-center mt-1">
//                       <p className="text-xs text-slate-500 truncate">
//                         {user.isOnline ? (
//                           <span className="flex items-center gap-1 text-green-600">
//                             <Circle className="h-2 w-2 fill-green-500" /> Online
//                           </span>
//                         ) : (
//                           `Last seen: ${formatLastSeen(user.lastSeen)}`
//                         )}
//                       </p>
                      
//                       {user.unreadCount > 0 && (
//                         <Badge variant="default" className="ml-auto bg-indigo-600 hover:bg-indigo-600">
//                           {user.unreadCount}
//                         </Badge>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </ScrollArea>
//     </div>
//   );
// }

// version 3

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  CircleUser,
  Circle,
  User,
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function UsersList({ users, onSelectUser, selectedUser, setIsLoggedIn }) {
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout');
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200">
        {/* <h2 className="text-lg font-semibold mb-4">Active Conversations</h2> */}
        <div className="  mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {/* {localStorage.getItem('chat_username')} */}
                  Admin
                </span>
              </div>
              <button
                onClick={handleLogout}
                className=" hover:bg-[#9ad3c7] rounded-full p-2 cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            className="pl-8 bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-170px)]">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No users available</div>
          ) : (
            <div>
              {filteredUsers.map((user) => (
              <div
                key={user.username}
                className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                  selectedUser === user.username ? 'bg-slate-100' : ''
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
                        {user.isOnline ? 'Now' : formatLastSeen(user.lastSeen)}
                      </span>
                    </div>
                    
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-slate-500 truncate">
                        {user.isOnline ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Circle className="h-2 w-2 fill-green-500" /> Online
                          </span>
                        ) : (
                          `Last seen: ${formatLastSeen(user.lastSeen)}`
                        )}
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
      </div>
    );
}