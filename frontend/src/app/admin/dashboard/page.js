'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { logout, getAdminData } from '../../../../lib/auth';
import axios from '../../../../lib/axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { getSocket } from '../../../../lib/socket';

export default function Dashboard() {
  const router = useRouter();
  const [chatLinks, setChatLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const admin = getAdminData();
    setAdminData(admin);
    
    if (admin) {
      fetchChatLinks();
      setupSocketListeners(admin.id);
    }
    
    return () => {
      const socket = getSocket();
      socket.off('link_generated');
      socket.off('admin_links');
      socket.off('error');
    };
  }, []);

  const setupSocketListeners = (adminId) => {
    const socket = getSocket();
    
    socket.on('link_generated', (data) => {
      setChatLinks((prevLinks) => [
        {
          linkId: data.linkId,
          createdAt: data.createdAt,
          hasClient: false
        },
        ...prevLinks
      ]);
      setGenerating(false);
      toast.success('New chat link generated successfully!');
    });
    
    socket.on('admin_links', (data) => {
      setChatLinks(data.links);
      setLoading(false);
    });
    
    socket.on('error', (error) => {
      toast.error(error.message || 'An error occurred');
      setGenerating(false);
      setLoading(false);
    });
    
    // Request links
    socket.emit('get_admin_links', { adminId });
  };

  const fetchChatLinks = async () => {
    try {
      const response = await axios.get('/api/chat/links');
      if (response.data.success) {
        setChatLinks(response.data.data.map(link => ({
          linkId: link.linkId,
          hasClient: Boolean(link.clientDeviceId),
          createdAt: link.createdAt
        })));
      }
    } catch (error) {
      console.error('Error fetching chat links:', error);
      toast.error('Failed to load chat links');
    } finally {
      setLoading(false);
    }
  };

  const generateNewLink = () => {
    if (!adminData) return;
    
    setGenerating(true);
    const socket = getSocket();
    socket.emit('generate_link', { adminId: adminData.id });
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleJoinChat = (linkId) => {
    router.push(`/admin/chat/${linkId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const copyToClipboard = (linkId) => {
    const fullLink = `${window.location.origin}/chat/${linkId}`;
    navigator.clipboard.writeText(fullLink);
    // toast.success('Link copied to clipboard!');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chat Links</h2>
              <button
                onClick={generateNewLink}
                disabled={generating}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {generating ? 'Generating...' : 'Generate New Link'}
              </button>
            </div>

            {loading ? (
              <p className="text-center py-4">Loading chat links...</p>
            ) : chatLinks.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No chat links found. Generate your first link!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                      <th className="py-3 px-4 text-left">Link ID</th>
                      <th className="py-3 px-4 text-left">Created At</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {chatLinks.map((link) => (
                      <tr key={link.linkId} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-mono text-sm">
                          {link.linkId.substring(0, 8)}...
                        </td>
                        <td className="py-4 px-4">
                          {formatDate(link.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          {link.hasClient ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Client Connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Awaiting Client
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleJoinChat(link.linkId)}
                              className="bg-blue-100 text-blue-700 py-1 px-3 rounded hover:bg-blue-200 transition-colors text-sm"
                            >
                              Join Chat
                            </button>
                            <button
                              onClick={() => copyToClipboard(link.linkId)}
                              className="bg-gray-100 text-gray-700 py-1 px-3 rounded hover:bg-gray-200 transition-colors text-sm"
                            >
                              Copy Link
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}