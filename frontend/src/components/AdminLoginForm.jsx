
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

    const handleAdminLoginSuccess = () => {
      setLoading(false);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('userType', 'admin');
      onSuccess('admin');
      window.location.reload(); // Reload to apply admin privileges
    };

    const handleSubAdminLoginSuccess = (userData) => {
      setLoading(false);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('userType', 'subadmin');
      localStorage.setItem('subAdminUsername', username);
      onSuccess('subadmin', userData);
      window.location.reload(); // Reload to apply subadmin privileges
    };

    const handleLoginFailure = () => {
      setLoading(false);
      setError('Invalid credentials. Please try again.');
    };

    const handleSubAdminLoginError = (data) => {
      setLoading(false);
      setError(data.message || 'Invalid sub-admin credentials. Please try again.');
    };

    socket.on('admin:loginSuccess', handleAdminLoginSuccess);
    socket.on('subadmin:loginSuccess', handleSubAdminLoginSuccess);
    socket.on('admin:loginFailure', handleLoginFailure);
    socket.on('subadmin:loginError', handleSubAdminLoginError);

    return () => {
      socket.off('admin:loginSuccess', handleAdminLoginSuccess);
      socket.off('subadmin:loginSuccess', handleSubAdminLoginSuccess);
      socket.off('admin:loginFailure', handleLoginFailure);
      socket.off('subadmin:loginError', handleSubAdminLoginError);
    };
  }, [socket, onSuccess, username]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center">
          <img
            src="/whatsapp.png"
            alt="WhatsApp Logo"
            className="h-12 w-12"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
        {/* <CardDescription className="text-center">
          Enter your credentials to access the admin dashboard
        </CardDescription> */}
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