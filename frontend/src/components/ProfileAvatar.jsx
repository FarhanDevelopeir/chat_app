import React, { useState, useRef } from 'react';
import { X, Camera, Upload, User } from 'lucide-react';

const ProfileAvatar = ({ user, onProfileUpdate, socket, isAdmin = false, isSubAdmin = false }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    // Your Cloudinary configuration
    const CLOUDINARY_UPLOAD_PRESET = "zeeshan_upload"; // Replace with your upload preset
    const CLOUDINARY_CLOUD_NAME = "durunzwx0"; // Replace with your cloud name

    const handleImageUpload = async (file) => {
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'uploads'); // Optional: organize in folders

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            if (data.secure_url) {
                // Update profile via socket
                if (isAdmin) {
                    socket.emit('admin:updateProfile', {
                        username: 'admin',
                        profilePicture: data.secure_url
                    });
                } else if (isSubAdmin) {
                    socket.emit('subadmin:updateProfile', {
                        username: user.username,
                        profilePicture: data.secure_url
                    });
                } else {
                    socket.emit('user:updateProfile', {
                        username: user.username,
                        profilePicture: data.secure_url
                    });
                }

                // Update local state
                onProfileUpdate(data.secure_url);
                setPreviewImage(data.secure_url);
                setIsDialogOpen(false);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }

            // Create preview
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);

            // Upload the file
            handleImageUpload(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setPreviewImage(null);
    };

    return (
        <>
            {/* Avatar Button */}
            <button
                onClick={() => setIsDialogOpen(true)}
                className="relative group"
                title="Update profile picture"
            >
                {user?.profilePicture ? (
                    <div className="relative">
                        <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover border-2 border-white/20 group-hover:border-white/40 transition-all duration-200"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <Camera className="h-3 w-3 text-white" />
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00a884] rounded-full flex items-center justify-center">
                            <Camera className="h-2 w-2 text-white" />
                        </div>
                    </div>
                )}
            </button>

            {/* Dialog Overlay */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center ">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Profile Photo
                            </h3>
                            <button
                                onClick={closeDialog}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={uploading}
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Current/Preview Image */}
                            <div className="flex justify-center mb-6">
                                {previewImage || user?.profilePicture ? (
                                    <img
                                        src={previewImage || user.profilePicture}
                                        alt="Profile preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Upload Options */}
                            <div className="space-y-3">
                                <button
                                    onClick={triggerFileSelect}
                                    disabled={uploading}
                                    className="w-full flex items-center justify-center gap-3 p-3 bg-[#00a884] text-white rounded-lg hover:bg-[#008069] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5" />
                                            {user?.profilePicture ? 'Change Photo' : 'Upload Photo'}
                                        </>
                                    )}
                                </button>
                                {user?.profilePicture && (
                                    <button
                                        onClick={() => {
                                            if (isAdmin) {
                                                socket.emit('admin:updateProfile', {
                                                    username: 'admin',
                                                    profilePicture: null
                                                });
                                            } else if (isSubAdmin){
                                                socket.emit('subadmin:updateProfile', {
                                                    username: user.username,
                                                    profilePicture: null
                                                });
                                            } else {
                                                socket.emit('user:updateProfile', {
                                                    username: user.username,
                                                    profilePicture: null
                                                });
                                            }
                                            onProfileUpdate(null);
                                            closeDialog();
                                        }}
                                        disabled={uploading}
                                        className="w-full p-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>

                            {/* File Size Info */}
                            <p className="text-sm text-gray-500 text-center mt-4">
                                Maximum file size: 5MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </>
    );
};

export default ProfileAvatar;