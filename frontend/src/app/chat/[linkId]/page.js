'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { getDeviceId } from '../../../../lib/deviceFingerprint';
import axios from '../../../../lib/axios';
import ChatInterface from '../../../components/ChatInterface';

export default function ClientChat() {
  const params = useParams();
  const { linkId } = params;
  const [loading, setLoading] = useState(true);
  const [validLink, setValidLink] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const validateChatLink = async () => {
      try {
        // Get device fingerprint
        const deviceIdValue = await getDeviceId();
        setDeviceId(deviceIdValue);
        
        // Validate the chat link
        const response = await axios.get(`/api/chat/links/${linkId}/validate?deviceId=${deviceIdValue}`);
        
        if (response.data.success) {
          setValidLink(true);
        } else {
          setError('This chat link is not valid.');
        }
      } catch (err) {
        console.error('Error validating chat link:', err);
        const errorMessage = err.response?.data?.message || 'Error validating chat link';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    validateChatLink();
  }, [linkId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p>Validating chat link...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Invalid Chat Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Private Chat</h1>
        
        <div className="bg-white rounded-lg shadow-md flex-1 overflow-hidden">
          <ChatInterface 
            linkId={linkId} 
            role="client" 
            deviceId={deviceId} 
          />
        </div>
      </div>
    </div>
  );
}