const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Create a new chat link
router.post('/links', protect, chatController.createChatLink);

// Get all chat links for an admin
router.get('/links', protect, chatController.getAdminLinks);

// Check if a chat link is valid
router.get('/links/:linkId/validate', chatController.validateChatLink);

// Get chat history
router.get('/history/:linkId', chatController.getChatHistory);

module.exports = router;