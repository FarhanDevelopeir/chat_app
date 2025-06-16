// 'use client';

// import { FileText, Download } from 'lucide-react';
// import { useState } from 'react';

// export default function FileMessage({ file }) {
//   const [downloading, setDownloading] = useState(false);

//   // console.log('file--', file)

//   const handleDownload = async () => {
//     try {
//       setDownloading(true);

//       const response = await fetch(file.url);
//       if (!response.ok) throw new Error('Failed to fetch file');

//       const blob = await response.blob();

//       // Ensure file type and extension are preserved
//       const contentType = response.headers.get("content-type") || blob.type || 'application/octet-stream';
//       const fileExtension = file.name.split('.').pop();
//       const fileName = `${file.name.includes('.') ? file.name : `${file.name}.${fileExtension}`}`;

//       const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: contentType }));

//       const link = document.createElement('a');
//       link.href = blobUrl;
//       link.download = fileName; // Correct name + extension
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       window.URL.revokeObjectURL(blobUrl);
//     } catch (error) {
//       console.error('Download failed', error);
//       alert('Download failed. Please try again.');
//     } finally {
//       setDownloading(false);
//     }
//   };


//   const renderFilePreview = () => {
//     if (file.type === 'image') {
//       return (
//         <div className="mb-2">
//           <img
//             src={file.url}
//             alt={file.name}
//             className="max-h-48 max-w-full object-contain rounded-md"
//           />
//         </div>
//       );
//     } else {
//       return (
//         <div className="flex items-center p-2 bg-white/80 rounded-md mb-2">
//           <FileText className="h-6 w-6 text-blue-500 mr-2" />
//           <div className="text-sm">
//             <p className="font-medium truncate max-w-[150px]">{file.name}</p>
//             <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
//           </div>
//         </div>
//       );
//     }
//   };

//   return (
//     <div className="flex flex-col">
//       {renderFilePreview()}
//       <div className="flex items-center justify-end">
//         <button
//           onClick={handleDownload}
//           disabled={downloading}
//           className="flex items-center text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
//         >
//           <Download className="h-3 w-3 mr-1" />
//           {downloading ? 'Downloading...' : 'Download'}
//         </button>
//       </div>
//     </div>
//   );
// }


'use client';

import { FileText, Download, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

// Shadcn Dialog components
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }) => (
  <div className={`relative max-w-full max-h-full ${className}`}>
    {children}
  </div>
);

export default function FileMessage({ file }) {
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await fetch(file.url);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const contentType = response.headers.get("content-type") || blob.type || 'application/octet-stream';
      const fileExtension = file.name.split('.').pop();
      const fileName = `${file.name.includes('.') ? file.name : `${file.name}.${fileExtension}`}`;

      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: contentType }));

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
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

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
    // Reset position when zooming out to 1x or less
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleRotate = () => {
    setRotation(prev => prev + 90);
    setPosition({ x: 0, y: 0 }); // Reset position on rotate
  };

  const resetControls = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    resetControls();
  };

  // Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    if (zoom <= 1) return; // Only allow dragging when zoomed
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [zoom, position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || zoom <= 1) return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag handlers
  const handleTouchStart = useCallback((e) => {
    if (zoom <= 1) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  }, [zoom, position]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || zoom <= 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, zoom]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderFilePreview = () => {
    if (file.type === 'image') {
      return (
        <div className="mb-2 ">
          <img
            src={file.url}
            alt={file.name}
            className="max-h-48 max-w-full object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowPreview(true)}
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center p-2 bg-white/80 rounded-md mb-2 z-[2000]">
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
    <>
      <div className="flex flex-col z-[2000]">
        {renderFilePreview()}
        <div className="flex items-center justify-end">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
          >
            <Download className="h-3 w-3 mr-1" />
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {file.type === 'image' && (
        <Dialog open={showPreview} onOpenChange={handlePreviewClose}>
          <DialogContent className="w-full h-full flex items-center justify-center z-[2000] relative">
            {/* Header Controls */}
            <div className="absolute top-4 md:left-4 md:right-4 z-[2000] md:flex md:items-center md:justify-between">
              <div className="flex items-center space-x-2 bg-black/50 rounded-lg px-3 py-2 mb-2 md:mb-0">
                <span className="text-white text-sm font-medium truncate max-w-[200px] sm:max-w-[400px]">
                  {file.name}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-1 bg-black/50 rounded-lg px-2 py-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 text-white hover:bg-white/20 rounded transition-colors"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-white text-xs px-2 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 text-white hover:bg-white/20 rounded transition-colors"
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Rotate Button */}
                <button
                  onClick={handleRotate}
                  className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* Close Button */}
                <button
                  onClick={handlePreviewClose}
                  className="p-2 bg-black/50 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div 
              ref={containerRef}
              className="w-full h-full flex items-center justify-center sm:p-20 overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="relative max-w-full max-h-full">
                <img
                  ref={imageRef}
                  src={file.url}
                  alt={file.name}
                  className={`max-w-full max-h-full object-contain transition-transform duration-200 select-none ${
                    zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                  }`}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                  draggable={false}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="flex items-center justify-between">
                <div className="bg-black/50 rounded-lg px-3 py-2">
                  <p className="text-white text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                {(zoom !== 1 || rotation !== 0 || position.x !== 0 || position.y !== 0) && (
                  <button
                    onClick={resetControls}
                    className="bg-black/50 text-white hover:bg-white/20 rounded-lg px-3 py-2 text-xs transition-colors"
                  >
                    Reset View
                  </button>
                )}
              </div>
            </div>

            {/* Instructions */}
            {/* <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-black/50 rounded-lg px-3 py-1">
                <p className="text-white text-xs opacity-70">
                  {zoom > 1 ? (
                    <span className="sm:hidden">Drag to pan • Tap outside to close</span>
                  ) : (
                    <span className="sm:hidden">Tap outside to close</span>
                  )}
                  {zoom > 1 && (
                    <span className="hidden sm:inline">Click and drag to pan</span>
                  )}
                </p>
              </div>
            </div> */}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}