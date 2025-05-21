
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSocket } from '@/context/SocketContext';
// import UserLogin from '@/components/UserLogin';
// import ChatInterface from '@/components/ChatInterface';
// import { MessageCircle, LogOut, User } from 'lucide-react';
// import ChatLoader from '@/components/ChatLoader';

// export default function UserChatPage() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [adminOnline, setAdminOnline] = useState(false);
//   const { socket } = useSocket();

//   useEffect(() => {
//     // Check if user is already logged in
//     const username = localStorage.getItem('chat_username');
//     const deviceId = localStorage.getItem('chat_device_id');
    
//     if (username && deviceId) {
//       setIsLoggedIn(true);
//     }
    
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     if (!socket) return;

//     // Listen for admin status
//     socket.on('admin:status', (status) => {
//       setAdminOnline(status.isOnline);
//     });

//     // Request admin status on connection
//     socket.emit('user:requestAdminStatus');

//     return () => {
//       socket.off('admin:status');
//     };
//   }, [socket]);

//   // Function to handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('chat_username');
//     // Keep deviceId for future recognition
//     setIsLoggedIn(false);
//     socket.emit('user:logout'); // Notify server about logout
//   };

//   if (loading) {
//     return (
   
//       <>
//       <ChatLoader/>
//       </>
//     );
//   }

  

//   return (
//     <div className="flex h-screen bg-[#f0f2f5]">
//        {!isLoggedIn && (
//               <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
//                 <UserLogin onSuccess={() => setIsLoggedIn(true)} />
//               </div>
//             )}
      
//           {/* Sidebar */}
//           <div className="w-1/4 bg-white border-r border-gray-200">
//             <div className="bg-[#00a884] text-white p-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <User className="h-5 w-5 mr-2" />
//                 <span className="font-medium">
//                   {localStorage.getItem('chat_username')}
//                 </span>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="text-white hover:bg-[#008f72] rounded-full p-2"
//                 title="Logout"
//               >
//                 <LogOut className="h-5 w-5" />
//               </button>
//             </div>
            
//             {/* Chat list - Currently only admin chat */}
//             <div className="cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200">
//               <div className="flex items-center">
//                 <div className="relative">
//                   <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold">
//                     A
//                   </div>
//                   {adminOnline && (
//                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//                   )}
//                 </div>
//                 <div className="ml-3">
//                   <p className="font-medium text-gray-900 flex items-center gap-1">Admin Support
//                     <img
//                 src="/blue-tick.png"
//                 alt="Blue Tick"
//                 className="w-5 h-5"
//               />

//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {adminOnline ? 'Online' : 'Offline'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Chat Area */}
//           <div className="flex-1 flex flex-col">
//             <ChatInterface />
//           </div>
        
     
//     </div>
//   );
// }


// implement responsive design for mobile view

'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UserLogin from '@/components/UserLogin';
import ChatInterface from '@/components/ChatInterface';
import { MessageCircle, LogOut, User, ArrowLeft, ChevronRight } from 'lucide-react';
import ChatLoader from '@/components/ChatLoader';

export default function UserChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminOnline, setAdminOnline] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile view transitions
  const [isMobile, setIsMobile] = useState(false); // Track if we're on mobile
  const { socket } = useSocket();

  // Check for mobile viewports
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const username = localStorage.getItem('chat_username');
    const deviceId = localStorage.getItem('chat_device_id');
    
    if (username && deviceId) {
      setIsLoggedIn(true);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for admin status
    socket.on('admin:status', (status) => {
      setAdminOnline(status.isOnline);
    });

    // Request admin status on connection
    socket.emit('user:requestAdminStatus');

    // Listen for new messages
    socket.on('message:receive', (message) => {
      // If we're on mobile and not showing chat, show notification or badge
      if (isMobile && !showChat && message.sender === 'admin') {
        // Could implement notification badge here
        console.log('New message received from admin');
      }
    });

    return () => {
      socket.off('admin:status');
      socket.off('message:receive');
    };
  }, [socket, isMobile, showChat]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    // Keep deviceId for future recognition
    setIsLoggedIn(false);
    socket.emit('user:logout'); // Notify server about logout
    setShowChat(false); // Reset mobile view
  };

  if (loading) {
    return <ChatLoader />;
  }

  // Mobile view handler
  const handleChatSelect = () => {
    setShowChat(true);
  };

  const handleBackClick = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      {!isLoggedIn && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
          <UserLogin onSuccess={() => setIsLoggedIn(true)} />
        </div>
      )}
      
      {/* Sidebar - Hidden on mobile when chat is showing */}
      <div className={`${isMobile && showChat ? 'hidden' : 'w-full md:w-1/4'} bg-white h-full flex flex-col`}>
        {/* Header */}
        <div className="bg-[#008069] text-white p-3 flex justify-between items-center sticky top-0 z-10">
          <div className="text-lg font-medium">WhatsApp</div>
          <div className="flex items-center space-x-2">
            <button className="text-white p-1.5 rounded-full">
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-white p-1.5 rounded-full"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat list - Currently only admin chat */}
        <div 
          className="cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center"
          onClick={handleChatSelect}
        >
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold">
                A
              </div>
              {adminOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900 flex items-center gap-1">
                Admin Support
                <img
                  src="/blue-tick.png"
                  alt="Blue Tick"
                  className="w-4 h-4 md:w-5 md:h-5"
                />
              </p>
              <p className="text-sm text-gray-500">
                {adminOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          {/* Mobile only arrow */}
          {isMobile && (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {/* Empty state for mobile */}
        {isMobile && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#f0f2f5]">
            <div className="bg-white p-5 rounded-lg shadow-sm text-center max-w-xs">
              <h3 className="font-medium text-lg mb-2">Welcome to WhatsApp Chat</h3>
              <p className="text-gray-600 mb-4">
                Tap on the Admin chat to start your conversation
              </p>
              <div className="w-16 h-16 rounded-full bg-[#00a884] flex items-center justify-center mx-auto text-white text-2xl font-bold">
                A
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Area - Full width on mobile when showing chat */}
      <div className={`${isMobile && !showChat ? 'hidden' : 'w-full'} md:flex-1 flex flex-col`}>
        <ChatInterface onBackClick={isMobile ? handleBackClick : null} />
      </div>
    </div>
  );
}