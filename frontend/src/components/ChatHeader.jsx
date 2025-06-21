// 1. ChatHeader.jsx - Header with user info and actions
'use client';

import { ArrowLeft, MoreVertical, Users, Edit, Search } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatHeader({
  isAdmin,
  selectedUser,
  selectedGroup,
  admin,
  groups,
  onBackClick,
  chatType,
  typing,
  adminOnline,
  isMobile,
  onEditUser,
  onEditGroup,
  onToggleSearch,
}) {
  const isGroupChat = chatType === 'group';

  const getChatDisplayName = () => {
    if (isGroupChat) {
      const group = groups.find(g => g._id === selectedGroup);
      return group ? group.name : 'Group';
    }
    return isAdmin ? selectedUser?.username : 'Admin Support';
  };

  return (
    <div className="flex fixed w-full top-0 right-0 z-40 md:z-0 md:static md:w-auto items-center justify-between p-2.5 md:p-3 bg-[#008069] md:bg-[#f0f2f5] border-b border-gray-200 text-white md:text-black">
      <div className="flex items-center">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="p-1 mr-2 text-white md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="relative">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium overflow-hidden">
            {isGroupChat ? (
              <Users className="h-5 w-5" />
            ) : (
              <>
                {isAdmin ? (
                  selectedUser?.profilePicture ? (
                    <img
                      src={selectedUser.profilePicture}
                      alt={`${selectedUser}'s profile picture`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    selectedUser?.username?.charAt(0).toUpperCase()
                  )
                ) : (
                  admin?.profilePicture ? (
                    <img
                      src={admin.profilePicture}
                      alt="Admin profile picture"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    'A'
                  )
                )}
              </>
            )}
          </div>
          {!isAdmin && !isGroupChat && adminOnline && (
            <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-[#008069] md:border-white"></div>
          )}
        </div>

        <div className="ml-2 md:ml-3">
          <p className="text-xs md:text-sm font-medium text-white md:text-gray-900 flex items-center gap-1">
            {getChatDisplayName()}
            {!isAdmin && !isGroupChat && (
              <img
                src="/blue-tick.png"
                alt="Blue Tick"
                className="w-3 h-3 md:w-5 md:h-5"
              />
            )}
          </p>
          {typing ? (
            <p className="text-xs text-gray-200 md:text-gray-500 animate-pulse">typing...</p>
          ) : (
            <p className="text-xs text-gray-200 md:text-gray-500">
              {isGroupChat && (
                `${groups.find(g => g._id === selectedGroup)?.members?.length || 0} members`
              )}
            </p>
          )}
        </div>
      </div>

      {isAdmin && <div className="text-sm text-gray-500 mt-2">
        IP: {isAdmin ? selectedUser?.ipAddress || "Not Found" : ""}
      </div>}

      {/* Action buttons */}
      <div className="flex items-center space-x-3">
        {isAdmin && isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white md:text-gray-800 p-1">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin && selectedUser && !isGroupChat && (
                <DropdownMenuItem onClick={onEditUser}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </DropdownMenuItem>
              )}
              {isAdmin && selectedGroup && isGroupChat && (
                <DropdownMenuItem onClick={onEditGroup}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

         {/* // Add this button in the action buttons section (after the edit buttons) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSearch}
        className="p-2 cursor-pointer"
        title="Search messages"
      >
        <Search className="h-4 w-4" />
      </Button>

        {isAdmin && selectedUser && !isGroupChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditUser}
            className="hidden md:flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
        {isAdmin && selectedGroup && isGroupChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditGroup}
            className="hidden md:flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Group
          </Button>
        )}
      </div>

     
    </div>
  );
}



// ChatHeader.jsx - Professional Header with user info and actions
// 'use client';

// import { ArrowLeft, MoreVertical, Users, Edit, Search, Phone, Video } from 'lucide-react';
// import { Button } from './ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export default function ChatHeader({
//   isAdmin,
//   selectedUser,
//   selectedGroup,
//   admin,
//   groups,
//   onBackClick,
//   chatType,
//   typing,
//   adminOnline,
//   isMobile,
//   onEditUser,
//   onEditGroup,
//   onToggleSearch,
// }) {
//   const isGroupChat = chatType === 'group';

//   const getChatDisplayName = () => {
//     if (isGroupChat) {
//       const group = groups.find(g => g._id === selectedGroup);
//       return group ? group.name : 'Group';
//     }
//     return isAdmin ? selectedUser?.username : 'Admin Support';
//   };

//   const getStatusText = () => {
//     if (typing) return 'typing...';
//     if (isGroupChat) {
//       const memberCount = groups.find(g => g._id === selectedGroup)?.members?.length || 0;
//       return `${memberCount} members`;
//     }
//     if (!isAdmin && adminOnline) return 'online';
//     return 'last seen recently';
//   };

//   const getInitials = (name) => {
//     if (!name) return 'U';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
//   };

//   return (
//     <div className="flex items-center justify-between h-16 px-4  bg-[#008069] md:bg-[#f0f2f5] border-b border-gray-200 shadow-sm">
//       {/* Left Section - Back button, Avatar, User Info */}
//       <div className="flex items-center space-x-3">
//         {onBackClick && isMobile && (
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onBackClick}
//             className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//         )}

//         {/* Avatar with online indicator */}
//         <div className="relative">
//           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden">
//             {isGroupChat ? (
//               <Users className="h-5 w-5" />
//             ) : (
//               <>
//                 {isAdmin ? (
//                   selectedUser?.profilePicture ? (
//                     <img
//                       src={selectedUser.profilePicture}
//                       alt={`${selectedUser.username}'s profile`}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     getInitials(selectedUser?.username)
//                   )
//                 ) : (
//                   admin?.profilePicture ? (
//                     <img
//                       src={admin.profilePicture}
//                       alt="Admin profile"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     'AD'
//                   )
//                 )}
//               </>
//             )}
//           </div>
          
//           {/* Online indicator */}
//           {!isAdmin && !isGroupChat && adminOnline && (
//             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
//           )}
//         </div>

//         {/* User/Group Info */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center space-x-2">
//             <h2 className="text-base font-semibold text-gray-900 truncate">
//               {getChatDisplayName()}
//             </h2>
//             {!isAdmin && !isGroupChat && (
//               <div className="flex-shrink-0">
//                 <img
//                   src="/blue-tick.png"
//                   alt="Verified"
//                   className="w-4 h-4"
//                 />
//               </div>
//             )}
//           </div>
          
//           <div className="flex items-center space-x-1 text-sm">
//             {/* <p className={`text-xs ${typing ? 'text-blue-600 font-medium animate-pulse' : 'text-gray-500'}`}>
//               {getStatusText()}
//             </p> */}
//             {isAdmin && selectedUser?.ipAddress && (
//               <>
//                 <span className="text-gray-300">IP•</span>
//                 <span className="text-xs text-gray-400 font-mono">
//                   {selectedUser.ipAddress}
//                 </span>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Right Section - Action buttons */}
//       <div className="flex items-center space-x-1">
//         {/* Call Actions (only for non-admin, non-group chats) */}
//         {!isAdmin && !isGroupChat && (
//           <>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full hidden sm:flex"
//               title="Voice call"
//             >
//               <Phone className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full hidden sm:flex"
//               title="Video call"
//             >
//               <Video className="h-4 w-4" />
//             </Button>
//           </>
//         )}

//         {/* Search Button */}
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={onToggleSearch}
//           className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
//           title="Search messages"
//         >
//           <Search className="h-4 w-4" />
//         </Button>

//         {/* Edit Button (Desktop) */}
//         {isAdmin && (
//           <>
//             {selectedUser && !isGroupChat && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={onEditUser}
//                 className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg shadow-sm"
//               >
//                 <Edit className="h-3.5 w-3.5" />
//                 Edit User
//               </Button>
//             )}
//             {selectedGroup && isGroupChat && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={onEditGroup}
//                 className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg shadow-sm"
//               >
//                 <Edit className="h-3.5 w-3.5" />
//                 Edit Group
//               </Button>
//             )}
//           </>
//         )}

//         {/* More Options (Mobile) */}
//         {isAdmin && isMobile && (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full md:hidden"
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               {selectedUser && !isGroupChat && (
//                 <DropdownMenuItem onClick={onEditUser} className="flex items-center gap-3 px-3 py-2">
//                   <Edit className="h-4 w-4 text-gray-500" />
//                   <span className="text-sm font-medium">Edit User</span>
//                 </DropdownMenuItem>
//               )}
//               {selectedGroup && isGroupChat && (
//                 <DropdownMenuItem onClick={onEditGroup} className="flex items-center gap-3 px-3 py-2">
//                   <Edit className="h-4 w-4 text-gray-500" />
//                   <span className="text-sm font-medium">Edit Group</span>
//                 </DropdownMenuItem>
//               )}
//               <DropdownMenuSeparator />
//               {/* <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-gray-600">
//                 <Phone className="h-4 w-4 text-gray-500" />
//                 <span className="text-sm">Voice Call</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-gray-600">
//                 <Video className="h-4 w-4 text-gray-500" />
//                 <span className="text-sm">Video Call</span>
//               </DropdownMenuItem> */}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         )}
//       </div>
//     </div>
//   );
// }