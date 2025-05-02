// server/src/utils/adminSetup.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Function to create the default admin user
exports.createAdminIfNotExists = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminUsername || !adminPassword) {
      console.error('Admin username or password not defined in environment variables');
      return;
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: adminUsername });
    
    // If admin doesn't exist, create it
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await Admin.create({
        username: adminUsername,
        password: hashedPassword
      });
      
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

// server/src/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;