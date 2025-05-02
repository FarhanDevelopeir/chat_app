const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Check if admin exists or create default admin
exports.checkAdminExists = async (req, res) => {
  try {
    let admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    
    if (!admin) {
      // Create default admin from .env
      admin = await Admin.create({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
      });
      return res.status(201).json({ success: true, adminExists: true, message: 'Default admin created' });
    }
    
    return res.status(200).json({ success: true, adminExists: true });
  } catch (error) {
    console.error('Error checking admin:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate email & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }
    
    // Check for admin
    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create token
    const token = admin.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get currently logged in admin
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};