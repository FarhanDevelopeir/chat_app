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
import { useEffect, useState } from 'react';

export default function ChatHeader({
  isAdmin,
  isSubAdmin,
  selectedUser,
  selectedGroup,
  admin,
  subAdmin,
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


  console.log('chat type in header', chatType)


  const isGroupChat = chatType === 'group';

    console.log('isGroupChat in header', isGroupChat)


  const getChatDisplayName = () => {
    if (isGroupChat) {
      const group = groups.find(g => g._id === selectedGroup);
      return group ? group.name : 'Group';
    }
    if (isAdmin || isSubAdmin) {
      return selectedUser?.username;
    }

    if (chatType === 'subadmin') {
      return typeof selectedUser === 'string' ? selectedUser : selectedUser?.username;
    }
    return 'Admin Support';
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
                {chatType === 'subadmin' ? (
                  subAdmin?.profilePicture ? (
                    <img
                      src={subAdmin.profilePicture}
                      alt={`${subAdmin.username}'s profile picture`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    subAdmin?.username?.charAt(0).toUpperCase()
                  )
                ) : (isAdmin || isSubAdmin) ? (
                  selectedUser?.profilePicture ? (
                    <img
                      src={selectedUser.profilePicture}
                      alt={`${selectedUser.username}'s profile picture`}
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
            {!isAdmin && !isGroupChat && subAdmin && (
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

      {(isAdmin || isSubAdmin) && !isGroupChat && <div className="text-sm text-gray-500 mt-2">
        IP: {(isAdmin || isSubAdmin) ? selectedUser?.ipAddress || "Not Found" : ""}
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

