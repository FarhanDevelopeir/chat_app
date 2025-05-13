'use client';

import { FileText, Download } from 'lucide-react';
import { useState } from 'react';

export default function FileMessage({ file }) {
  const [downloading, setDownloading] = useState(false);

  // console.log('file--', file)

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await fetch(file.url);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();

      // Ensure file type and extension are preserved
      const contentType = response.headers.get("content-type") || blob.type || 'application/octet-stream';
      const fileExtension = file.name.split('.').pop();
      const fileName = `${file.name.includes('.') ? file.name : `${file.name}.${fileExtension}`}`;

      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: contentType }));

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName; // Correct name + extension
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };


  const renderFilePreview = () => {
    if (file.type === 'image') {
      return (
        <div className="mb-2">
          <img
            src={file.url}
            alt={file.name}
            className="max-h-48 max-w-full object-contain rounded-md"
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center p-2 bg-white/80 rounded-md mb-2">
          <FileText className="h-6 w-6 text-blue-500 mr-2" />
          <div className="text-sm">
            <p className="font-medium truncate max-w-[150px]">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col">
      {renderFilePreview()}
      <div className="flex items-center justify-end">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <Download className="h-3 w-3 mr-1" />
          {downloading ? 'Downloading...' : 'Download'}
        </button>
      </div>
    </div>
  );
}
