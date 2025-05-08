


// 'use client';

// import { useState, useEffect } from 'react';
// import UserLogin from '@/components/UserLogin';
// import ChatInterface from '@/components/ChatInterface';

// export default function UserChatPage() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
  
//   useEffect(() => {
//     // Check if user is already logged in
//     const username = localStorage.getItem('chat_username');
//     const deviceId = localStorage.getItem('chat_device_id');
    
//     if (username && deviceId) {
//       setIsLoggedIn(true);
//     }
    
//     setLoading(false);
//   }, []);
  
//   // Function to handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('chat_username');
//     // Keep deviceId for future recognition
//     setIsLoggedIn(false);
//   };
  
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p>Loading...</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-100">
//       {isLoggedIn ? (
//         <div className="flex flex-col h-screen">
//           <div className="flex items-center justify-between p-4 bg-white shadow">
//             <h1 className="text-xl font-semibold">Chat Support</h1>
//             <button
//               onClick={handleLogout}
//               className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
//             >
//               Logout
//             </button>
//           </div>
//           <div className="flex-1">
//             <ChatInterface />
//           </div>
//         </div>
//       ) : (
//         <UserLogin onLoginSuccess={() => setIsLoggedIn(true)} />
//       )}
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UserLogin from '@/components/UserLogin';
import ChatInterface from '@/components/ChatInterface';
import { MessageCircle, LogOut, User } from 'lucide-react';

export default function UserChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminOnline, setAdminOnline] = useState(false);
  const { socket } = useSocket();

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

    return () => {
      socket.off('admin:status');
    };
  }, [socket]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    // Keep deviceId for future recognition
    setIsLoggedIn(false);
    socket.emit('user:logout'); // Notify server about logout
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <UserLogin onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      {isLoggedIn ? (
        <>
          {/* Sidebar */}
          <div className="w-1/4 bg-white border-r border-gray-200">
            <div className="bg-[#00a884] text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {localStorage.getItem('chat_username')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white hover:bg-[#008f72] rounded-full p-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            
            {/* Chat list - Currently only admin chat */}
            <div className="cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-200">
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
                  <p className="font-medium text-gray-900">Admin Support</p>
                  <p className="text-sm text-gray-500">
                    {adminOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatInterface />
          </div>
        </>
      ) : (
        <UserLogin onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}