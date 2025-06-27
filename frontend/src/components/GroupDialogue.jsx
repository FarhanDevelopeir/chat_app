import React, { useState, useEffect } from 'react';
import { X, Users, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const CreateGroupDialog = ({
  isOpen,
  onClose,
  users,
  socket,
  username,
  setIsGroupEditMode,
  setGroupToEdit = null,
  isEdit = false,
  groupToEdit = null,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill values in edit mode
  useEffect(() => {
    if (isEdit && groupToEdit) {
      setGroupName(groupToEdit.name || '');
      const memberUsers = users?.filter(u =>
        groupToEdit.members?.includes(u.username) && u.username !== username
      ) || [];
      setSelectedUsers(memberUsers);
    }
  }, [isEdit, groupToEdit, users, username]);

  const availableUsers = users?.filter(
    user =>
      user.username !== username &&
      !selectedUsers.some(selected => selected.username === user.username)
  );

  const handleUserSelect = (user) => {
    setSelectedUsers(prev => [...prev, user]);
    setIsDropdownOpen(false);
  };

  const handleUserRemove = (userToRemove) => {
    setSelectedUsers(prev =>
      prev.filter(user => user.username !== userToRemove.username)
    );
  };

  const handleSubmitGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setLoading(true);

    const groupData = {
      name: groupName.trim(),
      members: selectedUsers.map(user => user.username),
      createdBy: username,
    };

    if (isEdit && groupToEdit?._id) {
      socket.emit('group:update', {
        ...groupData,
        groupId: groupToEdit._id,
      });

      socket.once('group:updated', (response) => {
        setLoading(false);
        if (response.group) {
          resetForm();
          setIsGroupEditMode(false)
          setGroupToEdit(null)
          onClose();
        } else {
          alert(response.message || 'Failed to update group');
        }
      });
    } else {
      socket.emit('group:create', groupData);

      socket.once('group:created', (response) => {
        setLoading(false);
        if (response.group) {
          resetForm();
          onClose();
        } else {
          alert(response.message || 'Failed to create group');
        }
      });
    }
  };

  const resetForm = () => {
    setGroupName('');
    setSelectedUsers([]);
    setIsDropdownOpen(false);
  };

  const handleClose = () => {
    if (isEdit) {
      setIsGroupEditMode(false)
      setGroupToEdit(null)
    }
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isEdit ? 'Edit Group' : 'Create New Group'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent"
              maxLength={50}
            />
          </div>

          {/* Selected Users Display */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center bg-[#e3f2fd] text-[#1976d2] px-2 py-1 rounded-full text-sm"
                  >
                    <span>{user.username}</span>
                    <button
                      onClick={() => handleUserRemove(user)}
                      className="ml-1 text-[#1976d2] hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Selection Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Members
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent flex items-center justify-between"
              disabled={availableUsers?.length === 0}
            >
              <span className={availableUsers?.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                {availableUsers?.length === 0 ? 'No more users available' : 'Select users to add'}
              </span>
              <Plus className="h-4 w-4 text-gray-400" />
            </button>

            {isDropdownOpen && availableUsers?.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {availableUsers?.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => handleUserSelect(user)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-gray-500">
                        {user.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Text */}
          <div className="text-xs text-gray-500">
            <p>• Admin will be automatically added to the group</p>
            <p>• All group members can send and receive messages</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0 || loading}
            className="bg-[#00a884] hover:bg-[#00a884]/90"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Group' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
