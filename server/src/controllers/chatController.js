const { v4: uuidv4 } = require('uuid');
const ChatLink = require('../models/ChatLinks');
const Message = require('../models/Message');

// Create a new chat link
exports.createChatLink = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const linkId = uuidv4();
    
    const chatLink = await ChatLink.create({
      linkId,
      adminId,
      isActive: true
    });
    
    res.status(201).json({ 
      success: true, 
      data: chatLink 
    });
  } catch (error) {
    console.error('Create chat link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all links created by an admin
exports.getAdminLinks = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    const chatLinks = await ChatLink.find({ adminId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      data: chatLinks 
    });
  } catch (error) {
    console.error('Get admin links error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Validate a chat link
exports.validateChatLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { deviceId } = req.query;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }
    
    // Find the chat link
    const chatLink = await ChatLink.findOne({ linkId });
    
    if (!chatLink) {
      return res.status(404).json({
        success: false,
        message: 'Chat link not found'
      });
    }
    
    // Check if link is already claimed by another device
    if (chatLink.clientDeviceId && chatLink.clientDeviceId !== deviceId) {
      return res.status(403).json({
        success: false,
        message: 'This chat link has already been claimed by another device'
      });
    }
    
    // If first time access or same device, update deviceId
    if (!chatLink.clientDeviceId) {
      chatLink.clientDeviceId = deviceId;
      await chatLink.save();
    }
    
    res.status(200).json({
      success: true,
      data: {
        linkId: chatLink.linkId,
        isActive: chatLink.isActive
      }
    });
  } catch (error) {
    console.error('Validate chat link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get chat history for a link
exports.getChatHistory = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const messages = await Message.find({ chatLinkId: linkId })
      .sort({ timestamp: 1 });
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};