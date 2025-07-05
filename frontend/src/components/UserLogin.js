
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function UserLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { socket, connected } = useSocket();
  const router = useRouter();

  useEffect(() => {
    // Check if user has already logged in
    const savedUsername = localStorage.getItem('chat_username');
    const deviceId = localStorage.getItem('chat_device_id');

    console.log('savedUsername:', savedUsername);
    console.log('deviceId:', deviceId);

    if (savedUsername && deviceId && socket) {
      setLoading(true);

      // Attempt auto-login
      socket.emit('user:islogin', { username: savedUsername, deviceId });
    }
  }, [socket, connected]);

  useEffect(() => {
    if (!socket) return;

    // Handle login success
    const handleLoginSuccess = ({ user }) => {
      setLoading(false);
      localStorage.setItem('chat_username', user.username);
      window.location.reload();
    };

    // Handle login error
    const handleLoginError = ({ error }) => {
      console.log("Login error:", error);
      setLoading(false);
      setError(error);
    };

    socket.on('user:loginSuccess', handleLoginSuccess);
    socket.on('user:loginError', handleLoginError);

    return () => {
      socket.off('user:loginSuccess', handleLoginSuccess);
      socket.off('user:loginError', handleLoginError);
    };
  }, [socket, router]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the Terms & Conditions to continue');
      return;
    }

    setLoading(true);
    setError('');

    // Generate or retrieve device ID
    let deviceId = localStorage.getItem('chat_device_id');
    if (!deviceId) {
      deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('chat_device_id', deviceId);
    }

    // Send login request via socket with password
    socket.emit('user:login', { username, password, deviceId });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Check if form is valid for button activation
  const isFormValid = username.trim() !== '' && password.trim() !== '' && acceptTerms;

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
        <CardTitle className="text-2xl font-bold text-center">Welcome to WinChat</CardTitle>
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
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 ">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="pl-9 pr-10"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2  mb-1">
          <Checkbox
            id="acceptTerms"
            checked={acceptTerms}
            onCheckedChange={setAcceptTerms}

          />
          <label
            htmlFor="acceptTerms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I accept the{' '}
            {/* <a 
              href="#" 
              className="text-[#00a884] hover:underline"
              onClick={(e) => e.preventDefault()}
            > */}
              Terms & Conditions
            {/* </a> */}
          </label>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className={`w-full text-white rounded-md transition-colors duration-200 ${
            isFormValid && !loading
              ? 'bg-[#00a884] hover:bg-[#008f72] focus:ring-2 focus:ring-offset-2 focus:ring-[#00a884]'
              : 'bg-gray-300 cursor-not-allowed hover:bg-gray-300'
          }`}
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Authenticating...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}