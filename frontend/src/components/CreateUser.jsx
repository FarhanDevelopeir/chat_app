

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
    Copy
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
    setUserToEdit = null
    // handleCopyPassword
}) => {

    const [isSubmitting, setIsSubmitting] = useState(false);




    // Generate password on dialog open (only for create mode)
    useEffect(() => {
        if (dialogOpen) {
            if (isEditMode && userToEdit) {
                // Pre-populate form with user data for edit mode
                setNewUsername(userToEdit.username);
                // Don't show password for security reasons, let admin generate new one if needed
                // setNewPassword(userToEdit.password);
            } else {
                // Generate password for new user
                handleGeneratePassword();
                setNewUsername('');
                // Don't show password for security reasons, let admin generate new one if needed
                // setNewPassword(userToEdit.password);
            }
        }
    }, [dialogOpen, isEditMode, userToEdit])


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

        setIsSubmitting(true);

        try {
            console.log(isEditMode ? "Updating user:" : "Creating user with username:", newUsername);

            if (isEditMode) {
                // Emit event to update existing user
                const updateData = {
                    userID: userToEdit._id,
                    username: newUsername
                };

                // Only include password if it's provided
                if (newPassword.trim()) {
                    updateData.password = newPassword;
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
                        setIsEditMode(false);
                        setUserToEdit(null);
                        setNewUsername('');
                        setNewPassword('');
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
                socket.emit('admin:createUser', { username: newUsername, password: newPassword });

                // Listen for the response
                socket.once('admin:userCreated', (response) => {
                    if (response.success) {
                        toast({
                            title: "Success",
                            description: `User ${newUsername} created successfully`
                        });
                        setNewUsername('');
                        setNewPassword('');
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

    const handleDialogClose = () => {
        setIsEditMode(false);
        setUserToEdit(null);
        setNewUsername('');
        setNewPassword('');
        setDialogOpen(false);
    };

    return (
        <DialogContent  className="sm:max-w-md">
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
                        {/* Password {isEditMode && <span className="text-sm text-gray-500">(optional)</span>} */}
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