'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const connect = useCallback(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      setReconnecting(false);
      
      // Try to auto-login after reconnection
      const username = localStorage.getItem('chat_username');
      const deviceId = localStorage.getItem('chat_device_id');
      
      if (username && deviceId) {
        console.log('Attempting auto-login after reconnection');
        socketInstance.emit('user:login', { username, deviceId });
      }
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });
    
    socketInstance.on('reconnecting', () => {
      console.log('Socket reconnecting...');
      setReconnecting(true);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.log('Socket reconnection failed');
      setReconnecting(false);
    });
    
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    setSocket(socketInstance);
    
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  // Provide both the socket instance and connection status
  return (
    <SocketContext.Provider value={{ socket, connected, reconnecting }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}