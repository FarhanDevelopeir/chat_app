const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const ChatLink = require('../models/ChatLinks');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// In-memory storage for tracking active connections
const activeConnections = new Map();

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', async (socket) => {
    console.log('New client connected:', socket.id);

    // Join a chat room
    socket.on('join_chat', async ({ linkId, isAdmin, deviceId }) => {
      try {
        // Find chat link in database
        const chatLink = await ChatLink.findOne({ linkId });
        
        if (!chatLink) {
          socket.emit('error', { message: 'Invalid chat link' });
          return;
        }
        
        // If not admin, verify device ID
        if (!isAdmin) {
          // If client device ID is set and doesn't match
          if (chatLink.clientDeviceId && chatLink.clientDeviceId !== deviceId) {
            socket.emit('error', { message: 'This chat link can only be accessed from the original device' });
            return;
          }
          
          // First time client joining, set device ID
          if (!chatLink.clientDeviceId) {
            chatLink.clientDeviceId = deviceId;
            await chatLink.save();
          }
        }
        
        // Store connection info
        activeConnections.set(socket.id, {
          linkId,
          role: isAdmin ? 'admin' : 'client',
          deviceId: deviceId || null
        });
        
        // Join the room
        socket.join(linkId);
        
        // Fetch chat history
        const messages = await Message.find({ chatLinkId: linkId })
          .sort({ timestamp: 1 });
        
        // Convert MongoDB documents to plain objects
        const messageHistory = messages.map(msg => ({
          id: msg._id.toString(),
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp
        }));
        
        // Send chat history
        socket.emit('chat_history', messageHistory);
        
        // Notify about joined status
        socket.emit('chat_joined', { linkId });
        
        // If admin is joining and client is already connected
        if (isAdmin && chatLink.clientDeviceId) {
          // Find if client socket is active
          const clientSocket = [...activeConnections.entries()]
            .find(([_, data]) => 
              data.linkId === linkId && 
              data.role === 'client' && 
              data.deviceId === chatLink.clientDeviceId
            );
          
          if (clientSocket) {
            socket.emit('client_joined', { linkId });
          }
        }
        
        // If client is joining, notify admin
        if (!isAdmin) {
          // Find admin socket
          for (const [socketId, data] of activeConnections.entries()) {
            if (data.linkId === linkId && data.role === 'admin') {
              io.to(socketId).emit('client_joined', { linkId });
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Server error when joining chat' });
      }
    });

    // Handle message sending
    socket.on('send_message', async ({ linkId, message, sender }) => {
      try {
        // Verify connection is valid
        const connection = activeConnections.get(socket.id);
        if (!connection || connection.linkId !== linkId) {
          socket.emit('error', { message: 'Invalid connection' });
          return;
        }
        
        // Verify role matches sender
        if ((connection.role === 'admin' && sender !== 'admin') || 
            (connection.role === 'client' && sender !== 'client')) {
          socket.emit('error', { message: 'Sender role mismatch' });
          return;
        }
        
        // Find chat link
        const chatLink = await ChatLink.findOne({ linkId });
        if (!chatLink) {
          socket.emit('error', { message: 'Chat link not found' });
          return;
        }
        
        // Create message in database
        const newMessage = await Message.create({
          chatLinkId: linkId,
          text: message,
          sender
        });
        
        // Format for real-time delivery
        const messageData = {
          id: newMessage._id.toString(),
          text: newMessage.text,
          sender: newMessage.sender,
          timestamp: newMessage.timestamp
        };
        
        // Broadcast to all in the room
        io.to(linkId).emit('receive_message', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Server error when sending message' });
      }
    });

    // Generate new chat link
    socket.on('generate_link', async ({ adminId }) => {
      try {
        if (!adminId) {
          socket.emit('error', { message: 'Admin ID is required' });
          return;
        }
        
        // Verify admin ID is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
          socket.emit('error', { message: 'Invalid Admin ID format' });
          return;
        }
        
        const linkId = uuidv4();
        
        // Create in database
        const chatLink = await ChatLink.create({
          linkId,
          adminId,
          isActive: true
        });
        
        socket.emit('link_generated', { 
          linkId: chatLink.linkId,
          createdAt: chatLink.createdAt
        });
      } catch (error) {
        console.error('Error generating link:', error);
        socket.emit('error', { message: 'Server error when generating link' });
      }
    });

    // Get all active links for admin
    socket.on('get_admin_links', async ({ adminId }) => {
      try {
        if (!adminId) {
          socket.emit('error', { message: 'Admin ID is required' });
          return;
        }
        
        // Verify admin ID is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
          socket.emit('error', { message: 'Invalid Admin ID format' });
          return;
        }
        
        // Get links from database
        const chatLinks = await ChatLink.find({ adminId })
          .sort({ createdAt: -1 });
        
        // Format links
        const formattedLinks = chatLinks.map(link => ({
          linkId: link.linkId,
          hasClient: Boolean(link.clientDeviceId),
          createdAt: link.createdAt
        }));
        
        socket.emit('admin_links', { links: formattedLinks });
      } catch (error) {
        console.error('Error getting admin links:', error);
        socket.emit('error', { message: 'Server error when getting admin links' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Get connection info
      const connection = activeConnections.get(socket.id);
      if (connection) {
        const { linkId, role } = connection;
        
        // Notify the other party
        if (role === 'admin') {
          socket.to(linkId).emit('admin_disconnected');
        } else if (role === 'client') {
          socket.to(linkId).emit('client_disconnected', { linkId });
        }
        
        // Remove from active connections
        activeConnections.delete(socket.id);
      }
    });
  });

  return io;
};

module.exports = { setupSocket };