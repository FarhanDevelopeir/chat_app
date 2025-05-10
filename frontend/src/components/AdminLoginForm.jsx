// 'use client';

// import { useState, useEffect } from 'react';
// import { useSocket } from '@/context/SocketContext';

// export default function AdminLoginForm({ onSuccess }) {
//   const { socket } = useSocket();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//  // Example inside AdminLoginForm.jsx
// const handleLogin = () => {
//     socket.emit('admin:loginAttempt', { username, password });
  
//     socket.on('admin:loginSuccess', () => {
//       localStorage.setItem('adminLoggedIn', 'true'); // ✅ store login flag
//       onSuccess(); // tell parent to proceed
//     });
  
//     socket.on('admin:loginFailure', () => {
//       alert('Login failed');
//     });
//   };
  

//   useEffect(() => {
//     if (!socket) return;

//     const handleLoginSuccess = () => {
//       setLoading(false);
//       onSuccess(); // Notify parent
//     };

//     const handleLoginFailure = () => {
//       setError('Invalid credentials');
//       setLoading(false);
//     };

//     socket.on('admin:loginSuccess', handleLoginSuccess);
//     socket.on('admin:loginFailure', handleLoginFailure);

//     return () => {
//       socket.off('admin:loginSuccess', handleLoginSuccess);
//       socket.off('admin:loginFailure', handleLoginFailure);
//     };
//   }, [socket, onSuccess]);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
//         <h2 className="text-xl font-bold mb-4">Admin Login</h2>
//         <input
//           className="w-full mb-2 p-2 border rounded"
//           type="text"
//           placeholder="Admin Name"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <input
//           className="w-full mb-2 p-2 border rounded"
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         {error && <p className="text-red-500 text-sm">{error}</p>}
//         <button
//           className="w-full bg-blue-600 text-white p-2 rounded mt-2"
//           onClick={handleLogin}
//           disabled={loading}
//         >
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//       </div>
//     </div>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginForm({ onSuccess }) {
  const { socket } = useSocket();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    socket.emit('admin:loginAttempt', { username, password });
  };
  
  useEffect(() => {
    if (!socket) return;

    const handleLoginSuccess = () => {
      setLoading(false);
      localStorage.setItem('adminLoggedIn', 'true');
      onSuccess();
    };

    const handleLoginFailure = () => {
      setLoading(false);
      setError('Invalid admin credentials. Please try again.');
    };

    socket.on('admin:loginSuccess', handleLoginSuccess);
    socket.on('admin:loginFailure', handleLoginFailure);

    return () => {
      socket.off('admin:loginSuccess', handleLoginSuccess);
      socket.off('admin:loginFailure', handleLoginFailure);
    };
  }, [socket, onSuccess]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the admin dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="username"
              className="pl-9"
              placeholder="Admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              className="pl-9" 
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-[#00a884] hover:bg-[#008f72]"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Authenticating...
            </>
          ) : (
            'Login to Dashboard'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}