'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleLogin = () => {
    setLoading(true);
    
    // Generate admin ID and store in localStorage
    const adminId = uuidv4();
    localStorage.setItem('adminId', adminId);
    
    // Redirect to admin dashboard
    router.push('/admin/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
        
        <p className="text-gray-600 mb-8 text-center">
          Click the button below to access your admin dashboard where you can create and manage chat links for your clients.
        </p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? 'Loading...' : 'Enter Dashboard'}
        </button>
      </div>
    </div>
  );
}