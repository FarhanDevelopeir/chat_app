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
  setCreateGroupOpen
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedGroups, setSortedGroups] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Sort and filter groups
  useEffect(() => {
    // Apply search filter
    let filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setSortedGroups(filtered);
  }, [groups, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout');
  };

  const handleSelectGroup = (groupId) => {
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
              {sortedGroups.map((group) => (
                <div
                  key={group._id}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedGroup === group._id ? 'bg-slate-100' : ''
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
                        <p className="text-sm font-medium truncate text-slate-900">
                          {group.name}
                        </p>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500 truncate pr-2">
                          {group.members.length} members
                        </p>
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