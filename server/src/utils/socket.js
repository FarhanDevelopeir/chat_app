const socketIO = require('socket.io');
const User = require('../models/User');
const Message = require('../models/Message');

require('dotenv').config();


const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Map to store active connections
  const activeUsers = new Map();

  // Track admin status
  let adminIsOnline = false;

  // Helper to broadcast admin status to all users
  const broadcastAdminStatus = () => {
    io.emit('admin:status', { isOnline: adminIsOnline });
  };

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // User authentication/login
    socket.on('user:login', async ({ username, deviceId }) => {
      try {
        // Find or create user
        let user = await User.findOne({ username });

        if (!user) {
          user = new User({
            username,
            deviceId,
            isOnline: true
          });
        } else {
          user.deviceId = deviceId;
          user.isOnline = true;
          user.lastSeen = Date.now();
        }

        await user.save();

        // Store user details in the active users map
        activeUsers.set(username, {
          socketId: socket.id,
          userId: user._id
        });

        // Join a room with the username
        socket.join(username);

        // Send user list to admin
        const allUsers = await User.find({}, 'username isOnline lastSeen');
        io.to('admin').emit('admin:userList', allUsers);

        // Confirm successful login to the user
        socket.emit('user:loginSuccess', { user });

        // Send admin status to the user
        socket.emit('admin:status', { isOnline: adminIsOnline });

        // Send previous messages to the user
        const messages = await Message.find({
          $or: [
            { sender: username, receiver: "admin" },
            { sender: "admin", receiver: username }
          ]
        }).sort({ createdAt: 1 });

        socket.emit('messages:history', messages);
      } catch (error) {
        console.error('Login error:', error);
        socket.emit('user:loginError', { error: error.message });
      }
    });

    // Admin authentication
    socket.on('admin:login', () => {
      socket.join('admin');
      adminIsOnline = true;
      socket.emit('admin:loginSuccess');
      broadcastAdminStatus();

      // Send user list to admin
      User.find({}, 'username isOnline lastSeen')
        .then(users => {
          socket.emit('admin:userList', users);
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        });
    });

    socket.on('admin:loginAttempt', ({ username, password }) => {
      if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        console.log('✅ Admin authenticated:', username);
        // socket.join('admin');
        adminIsOnline = true;
        socket.emit('admin:loginSuccess');
        broadcastAdminStatus();

        // Send user list to admin
        User.find({}, 'username isOnline lastSeen')
          .then(users => {
            socket.emit('admin:userList', users);
          })
          .catch(error => {
            console.error('Error fetching users:', error);
          });

        // // Send the current user list or whatever data you want
        // const userList = getAllConnectedUsers(); // You should define this
        // socket.emit('admin:userList', userList);
      } else {
        console.log('❌ Admin login failed');
        socket.emit('admin:loginFailure');
      }
    });

    // Admin selects a user to chat with
    socket.on('admin:selectUser', async (username) => {
      try {
        // Get chat history with the selected user
        const messages = await Message.find({
          $or: [
            { sender: username, receiver: "admin" },
            { sender: "admin", receiver: username }
          ]
        }).sort({ createdAt: 1 });

        socket.emit('messages:history', messages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    });

    socket.on('user:typing', ({ sender, receiver }) => {
      io.to(receiver).emit('user:typing', { sender });
    });

    socket.on('user:stopTyping', ({ sender, receiver }) => {
      io.to(receiver).emit('user:stopTyping', { sender });
    });

    // Handle new message
    socket.on('message:send', async (messageData) => {
      try {
        const { sender, receiver, content } = messageData;

        // Save message to database
        const newMessage = new Message({
          sender,
          receiver,
          content,
          isRead: false
        });

        await newMessage.save();

        // Send to receiver
        io.to(receiver).emit('message:receive', newMessage);

        // Send back to sender for confirmation
        socket.emit('message:sent', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { error: error.message });
      }
    });

    // Mark messages as read
    socket.on('messages:markRead', async ({ sender, receiver }) => {
      try {
        await Message.updateMany(
          { sender, receiver, isRead: false },
          { isRead: true }
        );

        io.to(sender).emit('messages:updated');
        io.to(receiver).emit('messages:updated');
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('admin:logout', () => {
      socket.leave('admin');
      adminIsOnline = false;
      broadcastAdminStatus();
      console.log('Admin logged out:', adminIsOnline);
    })

    socket.on('user:logout', async() => {
      // Find the disconnected user and update their status
      for (const [username, data] of activeUsers.entries()) {
        if (data.socketId === socket.id) {
          await User.findByIdAndUpdate(data.userId, {
            isOnline: false,
            lastSeen: Date.now()
          });

          activeUsers.delete(username);

          // Notify admin about user's offline status
          const allUsers = await User.find({}, 'username isOnline lastSeen');
          io.to('admin').emit('admin:userList', allUsers);
          socket.emit('user:logoutSuccess', { message: 'Logged out successfully' });

          break;
        }
      }
    })


    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      // Check if it was the admin who disconnected
      const isAdminSocket = Array.from(socket.rooms).includes('admin');
      if (isAdminSocket) {
        adminIsOnline = false;
        broadcastAdminStatus();
        log('Admin disconnected:', adminIsOnline);
      }

      // Find the disconnected user and update their status
      for (const [username, data] of activeUsers.entries()) {
        if (data.socketId === socket.id) {
          await User.findByIdAndUpdate(data.userId, {
            isOnline: false,
            lastSeen: Date.now()
          });

          activeUsers.delete(username);

          // Notify admin about user's offline status
          const allUsers = await User.find({}, 'username isOnline lastSeen');
          io.to('admin').emit('admin:userList', allUsers);
          socket.emit('user:logoutSuccess', { message: 'Logged out successfully' });


          break;
        }
      }
    });
  });

  return io;
};

module.exports = setupSocket;