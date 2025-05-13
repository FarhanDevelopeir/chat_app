'use client';

import { useState, useRef } from 'react';
import { Upload, Image, FileText, X, Camera } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

export default function FileUpload({ onUpload, showCameraButton = false }) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [activeTab, setActiveTab] = useState('image');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isImageOnly, setIsImageOnly] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const resetState = () => {
        setFile(null);
        setPreviewUrl(null);
        setProgress(0);
        setUploading(false);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(selectedFile);
            setOpen(true);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleCameraClick = () => {
        setIsImageOnly(true);
        // Trigger the file input programmatically
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);

        console.log('activeTab', activeTab)

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'zeeshan_upload'); // Replace with your preset
        formData.append('folder', 'uploads'); // Optional
        // formData.append('access_mode', 'public');

        const resourceType = activeTab === 'document' ? 'raw' : 'image';

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/durunzwx0/${resourceType}/upload`, // Replace with your cloud name
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    },
                }
            );

            const uploadedUrl = activeTab === 'document' ? response.data.url : response.data.secure_url;

            console.log('response', response)

            onUpload({
                file,
                type: activeTab,
                name: file.name,
                size: file.size,
                url: uploadedUrl,
            });

            setOpen(false);
            resetState();
            setIsImageOnly(false);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const validateFile = () => {
        if (!file) return false;

        if (activeTab === 'image') {
            return file.type.startsWith('image/');
        } else if (activeTab === 'document') {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain'
            ];
            return allowedTypes.includes(file.type);
        }

        return false;
    };

    const getFileTypeError = () => {
        if (!file) return '';

        if (activeTab === 'image' && !file.type.startsWith('image/')) {
            return 'Please select a valid image file (JPEG, PNG, GIF, etc.)';
        } else if (activeTab === 'document') {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain'
            ];

            if (!allowedTypes.includes(file.type)) {
                return 'Please select a valid document (PDF, DOC, DOCX, XLS, XLSX, TXT)';
            }
        }

        return '';
    };

    const handleClose = () => {
        setOpen(false);
        resetState();
        setIsImageOnly(false);
    };

    // Hidden file input for camera button
    const hiddenImageInput = (
        <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
        />
    );

    return (
        <>
            {/* Regular Upload Dialog Button */}
            { <Dialog open={open} onOpenChange={setOpen}>
                {!showCameraButton && <DialogTrigger asChild>
                    <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none"
                        aria-label="Attach file"
                    >
                        <Upload className="h-5 w-5" />
                    </button>
                </DialogTrigger>}

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                    </DialogHeader>

                    {isImageOnly ? (
                        // Image-only view (when opened via camera button)
                        <div className="pt-4">
                            <div className="flex flex-col items-center justify-center">
                                {previewUrl ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-64 max-w-full object-contain rounded-md"
                                        />
                                        <button
                                            onClick={resetState}
                                            className="absolute top-2 right-2 bg-red-100 p-1 rounded-full"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="h-10 w-10 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Regular tabs view (when opened via upload button)
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="image" onClick={() => setActiveTab('image')}>
                                    <Image className="mr-2 h-4 w-4" />
                                    Image
                                </TabsTrigger>
                                <TabsTrigger value="document" onClick={() => setActiveTab('document')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Document
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="image" className="pt-4">
                                <div className="flex flex-col items-center justify-center">
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-h-64 max-w-full object-contain rounded-md"
                                            />
                                            <button
                                                onClick={resetState}
                                                className="absolute top-2 right-2 bg-red-100 p-1 rounded-full"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="h-10 w-10 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="document" className="pt-4">
                                <div className="flex flex-col items-center justify-center">
                                    {file && activeTab === 'document' ? (
                                        <div className="flex items-center justify-between w-full p-4 border rounded-md">
                                            <div className="flex items-center">
                                                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                                                <div>
                                                    <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={resetState}
                                                className="p-1 rounded-full hover:bg-gray-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileText className="h-10 w-10 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, TXT (MAX. 10MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    {file && getFileTypeError() && (
                        <div className="text-sm text-red-500 mt-2">
                            {getFileTypeError()}
                        </div>
                    )}

                    {uploading && (
                        <div className="w-full mt-4">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                                Uploading... {progress}%
                            </p>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={!validateFile() || uploading}
                        >
                            {uploading ? 'Uploading...' : 'Send'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>}

            {/* Camera Button - Only shown if showCameraButton prop is true */}
            {showCameraButton && (
                <>
                    <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none ml-1"
                        aria-label="Take photo"
                        onClick={handleCameraClick}
                    >
                        <Camera className="h-5 w-5" />
                    </button>
                    {hiddenImageInput}
                </>
            )}
        </>
    );
}