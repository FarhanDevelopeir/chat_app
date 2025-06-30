'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Copy,
    X,
    Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const CreateUser = ({
    socket,
    dialogOpen,
    setDialogOpen,
    newUsername,
    setNewUsername,
    newPassword,
    setNewPassword,
    isEditMode = false,
    userToEdit = null,
    setIsEditMode = false,
    setUserToEdit = null,
    users = [] // Add users prop for user selection
}) => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubAdmin, setIsSubAdmin] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    console.log('userToEdit', userToEdit)

    // Generate password on dialog open (only for create mode)
    useEffect(() => {
        if (dialogOpen) {
            if (isEditMode && userToEdit) {
                setNewUsername(userToEdit.username);
                setIsSubAdmin(userToEdit.isSubAdmin || false);

                // If editing a sub admin, load their assigned users
                if (userToEdit.isSubAdmin && userToEdit.assignedUsers) {
                    const assignedUserObjects = users.filter(user =>
                        userToEdit.assignedUsers.includes(user.username) ||
                        userToEdit.assignedUsers.includes(user._id)
                    );
                    setSelectedUsers(assignedUserObjects);
                }
            } else {
                handleGeneratePassword();
                setNewUsername('');
                setIsSubAdmin(false);
                setSelectedUsers([]);
            }
        }
    }, [dialogOpen, isEditMode, userToEdit, users]);

    // Reset selected users when isSubAdmin is unchecked
    useEffect(() => {
        if (!isSubAdmin) {
            setSelectedUsers([]);
        }
    }, [isSubAdmin]);

    // Filter available users (exclude sub admins and already selected users)
    const availableUsers = users?.filter(
        user =>
            !user.isSubAdmin && // Exclude sub admins
            !selectedUsers.some(selected => selected.username === user.username)
    );

    const generateStrongPassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    };

    const handleGeneratePassword = () => {
        setNewPassword(generateStrongPassword());
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(newPassword);
        toast({
            title: "Password copied",
            description: "Password has been copied to clipboard"
        });
    };

    const handleUserSelect = (user) => {
        setSelectedUsers(prev => [...prev, user]);
        setIsDropdownOpen(false);
    };

    const handleUserRemove = (userToRemove) => {
        setSelectedUsers(prev =>
            prev.filter(user => user.username !== userToRemove.username)
        );
    };

    const handleCreateUser = async () => {
        console.log(isEditMode ? "update user clicked" : "create user clicked");

        if (!newUsername || (!isEditMode && !newPassword)) {
            toast({
                title: "Error",
                description: isEditMode
                    ? "Username is required"
                    : "Username and password are required",
                variant: "destructive"
            });
            return;
        }

        // Validate sub admin has selected users
        if (isSubAdmin && selectedUsers.length === 0) {
            toast({
                title: "Error",
                description: "Sub admin must have at least one assigned user",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            console.log(isEditMode ? "Updating user:" : "Creating user with username:", newUsername);

            if (isEditMode) {
                // Emit event to update existing user
                const updateData = {
                    userID: userToEdit._id,
                    username: newUsername,
                    isSubAdmin
                };

                // Only include password if it's provided
                if (newPassword.trim()) {
                    updateData.password = newPassword;
                }

                // Include assigned users if sub admin
                if (isSubAdmin) {
                    updateData.assignedUsers = selectedUsers.map(user => user.username);
                }

                console.log("updateData", updateData);

                socket.emit('admin:updateUser', updateData);

                // Listen for the response
                socket.once('admin:userUpdated', (response) => {
                    if (response.success) {
                        toast({
                            title: "Success",
                            description: `User ${newUsername} updated successfully`
                        });
                        resetForm();
                        setDialogOpen(false);
                    } else {
                        toast({
                            title: "Error",
                            description: response.message || "Failed to update user",
                            variant: "destructive"
                        });
                    }
                    setIsSubmitting(false);
                });
            } else {
                // Emit event to create a new user
                const createData = {
                    username: newUsername,
                    password: newPassword,
                    isSubAdmin
                };

                // Include assigned users if sub admin
                if (isSubAdmin) {
                    createData.assignedUsers = selectedUsers.map(user => user.username);
                }

                socket.emit('admin:createUser', createData);

                // Listen for the response
                socket.once('admin:userCreated', (response) => {
                    if (response.success) {
                        toast({
                            title: "Success",
                            description: `User ${newUsername} created successfully`
                        });
                        resetForm();
                        setDialogOpen(false);
                    } else {
                        toast({
                            title: "Error",
                            description: response.message || "Failed to create user",
                            variant: "destructive"
                        });
                    }
                    setIsSubmitting(false);
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: isEditMode ? "Failed to update user" : "Failed to create user",
                variant: "destructive"
            });
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        if (isEditMode) {
            setIsEditMode(false);
            setUserToEdit(null);
        }
        setNewUsername('');
        setNewPassword('');
        setIsSubAdmin(false);
        setSelectedUsers([]);
        setIsDropdownOpen(false);
    };

    const handleDialogClose = () => {
        resetForm();
        setDialogOpen(false);
    };

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
                <DialogDescription>
                    {isEditMode
                        ? "Update user account details. Leave password empty to keep current password."
                        : "Create a new user account. The password will be set but can be changed later."
                    }
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        placeholder="Enter username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">
                        Password
                    </Label>
                    <div className="flex space-x-2">
                        <Input
                            id="password"
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="flex-1"
                            placeholder={isEditMode ? "Enter new password or leave empty" : "Generated password"}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyPassword}
                            title="Copy Password"
                            disabled={!newPassword}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleGeneratePassword}
                        >
                            Generate
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <input
                        id="isSubAdmin"
                        type="checkbox"
                        checked={isSubAdmin}
                        onChange={(e) => setIsSubAdmin(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <Label htmlFor="isSubAdmin">Is Sub Admin</Label>
                </div>

                {/* User Selection Section - Only show when isSubAdmin is checked */}
                {isSubAdmin && (
                    <div className="space-y-3 pt-2 border-t">
                        <Label className="text-sm font-medium">Assign Users to Sub Admin</Label>

                        {/* Selected Users Display */}
                        {selectedUsers.length > 0 && (
                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selected Users ({selectedUsers.length})
                                </Label>
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
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent flex items-center justify-between text-sm"
                                disabled={availableUsers?.length === 0}
                            >
                                <span className={availableUsers?.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                                    {availableUsers?.length === 0 ? 'No more users available' : 'Select users to assign'}
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
                                                <div className="font-medium text-sm">{user.username}</div>
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
                            <p>• Sub admin will only be able to see and manage assigned users</p>
                            <p>• At least one user must be assigned to create a sub admin</p>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={handleDialogClose}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleCreateUser}
                    disabled={isSubmitting}
                    className="bg-[#00a884] hover:bg-[#009874]"
                >
                    {isSubmitting
                        ? (isEditMode ? "Updating..." : "Creating...")
                        : (isEditMode ? "Update User" : "Create User")
                    }
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default CreateUser