// 'use client';

// import { useState, useEffect } from 'react';
// import { useSocket } from '@/context/SocketContext';
// import UsersList from '../../components/UserList';
// import ChatInterface from '../../components/ChatInterface';
// import AdminLoginForm from '@/components/AdminLoginForm';

// export default function AdminChatPage() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const { socket } = useSocket();

  

//   useEffect(() => {
//     const alreadyLoggedIn = localStorage.getItem('adminLoggedIn');
//     if (alreadyLoggedIn === 'true' && socket) {
//       socket.emit('admin:login'); // 👈 emit login on refresh
//       setIsLoggedIn(true);
//       setLoading(false);
//     } else {
//       setLoading(false);
//     }
//   }, [socket]); // 👈 make sure this re-runs when socket is ready


//   useEffect(() => {
//     if (!socket ) return;

//     const handleUserList = (userList) => {
//       setUsers(userList);
//     };

//     socket.on('admin:userList', handleUserList);

//     return () => {
//       socket.off('admin:userList', handleUserList);
//     };
//   }, [socket]);

//   const handleSelectUser = (username) => {
//     setSelectedUser(username);
//   };

//   // Function to handle logout
//   const handleLogout = () => {

//     localStorage.removeItem('adminLoggedIn');
//     setIsLoggedIn(false);
//     socket.emit('admin:logout'); // 👈 emit logout event to server
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p>Loading admin panel...</p>
//       </div>
//     );
//   }

//   if (!isLoggedIn) {
//     return <AdminLoginForm onSuccess={() => setIsLoggedIn(true)} />;
//   }


//   return (
//     <div className="flex flex-col h-screen">
//       <header className="p-4 flex justify-between  bg-gray-800 text-white">
//         <h1 className="text-xl font-bold">Admin Chat Panel</h1>
//         <button
//           className="ml-auto bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
//           // onClick={() => {
//           //   localStorage.removeItem('adminLoggedIn');
//           //   setIsLoggedIn(false);
//           // }}
//           onClick={handleLogout}
//         >
//           Logout
//         </button>

//       </header>

//       <div className="flex flex-1">
//         <div className="w-1/4 border-r border-gray-200">
//           <UsersList
//             users={users}
//             onSelectUser={handleSelectUser}
//             selectedUser={selectedUser}
//           />
//         </div>

//         <div className="flex-1">
//           <ChatInterface isAdmin={true} selectedUser={selectedUser} />
//         </div>
//       </div>
//     </div>
//   );
// }


// version 2

// 'use client';

// import { useState, useEffect } from 'react';
// import { useSocket } from '@/context/SocketContext';
// import UsersList from '../../components/UserList';
// import ChatInterface from '../../components/ChatInterface';
// import AdminLoginForm from '@/components/AdminLoginForm';
// import { Button } from '@/components/ui/button';
// import { 
//   LogOut,
//   CircleUser
// } from 'lucide-react';

// export default function AdminChatPage() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const { socket } = useSocket();

//   useEffect(() => {
//     const alreadyLoggedIn = localStorage.getItem('adminLoggedIn');
//     if (alreadyLoggedIn === 'true' && socket) {
//       socket.emit('admin:login'); 
//       setIsLoggedIn(true);
//       setLoading(false);
//     } else {
//       setLoading(false);
//     }
//   }, [socket]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleUserList = (userList) => {
//       setUsers(userList);
//     };

//     socket.on('admin:userList', handleUserList);

//     return () => {
//       socket.off('admin:userList', handleUserList);
//     };
//   }, [socket]);

//   const handleSelectUser = (username) => {
//     setSelectedUser(username);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('adminLoggedIn');
//     setIsLoggedIn(false);
//     socket.emit('admin:logout');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="flex flex-col items-center gap-2">
//           <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
//           <p className="text-gray-600">Loading admin panel...</p>
//         </div>
//       </div>
//     );
//   }

//   // Render both admin login and chat interface, but blur and disable chat when not logged in
//   return (
//     <div className="flex flex-col h-screen bg-slate-50">
//       {!isLoggedIn && (
//         <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
//           <AdminLoginForm onSuccess={() => setIsLoggedIn(true)} />
//         </div>
//       )}

//       <header className="p-4 flex items-center justify-between bg-slate-900 text-white shadow-md">
//         <div className="flex items-center gap-2">
//           <CircleUser className="h-6 w-6" />
//           <h1 className="text-xl font-bold">Admin Dashboard</h1>
//         </div>
        
//         {isLoggedIn && (
//           <Button 
//             variant="destructive" 
//             size="sm"
//             onClick={handleLogout}
//             className="flex items-center gap-2"
//           >
//             <LogOut className="h-4 w-4" />
//             <span>Logout</span>
//           </Button>
//         )}
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         <div className="w-1/4 border-r border-slate-200 bg-white shadow-sm">
//           <UsersList
//             users={users}
//             onSelectUser={handleSelectUser}
//             selectedUser={selectedUser}
//           />
//         </div>

//         <div className="flex-1">
//           <ChatInterface isAdmin={true} selectedUser={selectedUser} />
//         </div>
//       </div>
//     </div>
//   );
// }

// version 3


'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import UsersList from '../../components/UserList';
import ChatInterface from '../../components/ChatInterface';
import AdminLoginForm from '@/components/AdminLoginForm';
import { Button } from '@/components/ui/button';
import { 
  LogOut,
  CircleUser
} from 'lucide-react';
import ChatLoader from '@/components/ChatLoader';

export default function AdminChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    const alreadyLoggedIn = localStorage.getItem('adminLoggedIn');
    if (alreadyLoggedIn === 'true' && socket) {
      socket.emit('admin:login'); 
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleUserList = (userList) => {
      setUsers(userList);
    };

    socket.on('admin:userList', handleUserList);

    return () => {
      socket.off('admin:userList', handleUserList);
    };
  }, [socket]);

  const handleSelectUser = (username) => {
    setSelectedUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    socket.emit('admin:logout');
  };

  if (loading) {
    return (
      // <div className="flex items-center justify-center min-h-screen">
      //   <div className="flex flex-col items-center gap-2">
      //     <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      //     <p className="text-gray-600">Loading admin panel...</p>
      //   </div>
      // </div>
      <>
      <ChatLoader/>
      </>
    );
  }

  // Render both admin login and chat interface, but blur and disable chat when not logged in
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {!isLoggedIn && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
          <AdminLoginForm onSuccess={() => setIsLoggedIn(true)} />
        </div>
      )}
{/* 
      <header className="p-4 flex items-center justify-between bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2">
          <CircleUser className="h-6 w-6" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        {isLoggedIn && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        )}
      </header> */}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r border-slate-200 bg-white shadow-sm overflow-hidden">
          <UsersList
            users={users}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
            setIsLoggedIn={setIsLoggedIn}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface isAdmin={true} selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
}