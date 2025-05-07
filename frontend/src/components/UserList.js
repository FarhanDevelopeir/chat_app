'use client';

import { useState, useEffect } from 'react';

export default function UsersList({ users, onSelectUser, selectedUser }) {
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
  
  return (
    <div className="w-full h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users available</div>
        ) : (
          <ul>
            {users.map((user) => (
              <li
                key={user.username}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  selectedUser === user.username ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectUser(user.username)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">
                        {user.isOnline ? (
                          <span className="text-green-500">Online</span>
                        ) : (
                          `Last seen: ${formatLastSeen(user.lastSeen)}`
                        )}
                      </p>
                    </div>
                  </div>
                  {user.isOnline && (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}