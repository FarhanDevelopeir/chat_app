
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
    // handleCopyPassword
}) => {

  const [isSubmitting, setIsSubmitting] = useState(false);

    
  // Generate password on dialog open
  useEffect(() => {
    if (dialogOpen) {
      handleGeneratePassword();
    }
  }, [dialogOpen])


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
    if (!newUsername || !newPassword) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
        console.log("Creating user with username:", newUsername);

        console.log("socket", socket);
        

        
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
;


    return (

        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                    Create a new user account. The password will be set but can be changed later.
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
                    <Label htmlFor="password">Password</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="password"
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyPassword}
                            title="Copy Password"
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
                    onClick={() => setDialogOpen(false)}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleCreateUser}
                    disabled={isSubmitting}
                    className="bg-[#00a884] hover:bg-[#009874]"
                >
                    {isSubmitting ? "Creating..." : "Create User"}
                </Button>
            </DialogFooter>
        </DialogContent>

    )
}

export default CreateUser