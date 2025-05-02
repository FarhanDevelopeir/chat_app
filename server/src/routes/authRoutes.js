const express = require('express');
const router = express.Router();
const { login, getMe, checkAdminExists } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Routes
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/check-admin', checkAdminExists);

module.exports = router;