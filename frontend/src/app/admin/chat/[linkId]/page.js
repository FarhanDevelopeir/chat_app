'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getAdminData } from '../../../../../lib/auth';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import ChatInterface from '../../../../components/ChatInterface';

export default function AdminChat() {
  const params = useParams();
  const router = useRouter();
  const { linkId } = params;
  const [adminData, setAdminData] = useState(null);
  
  useEffect(() => {
    const admin = getAdminData();
    
    if (!admin) {
      toast.error('Admin authentication required');
      router.push('/admin/login');
      return;
    }
    
    setAdminData(admin);
  }, [router]);
  
  const handleBackToDashboard = () => {
    router.push('/admin/dashboard');
  };
  
  if (!adminData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Chat</h1>
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md flex-1 overflow-hidden">
            <ChatInterface 
              linkId={linkId} 
              role="admin" 
              deviceId={adminData.id} 
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}