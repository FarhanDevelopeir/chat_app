const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatLinkId: {
    type: String,
    required: true,
    ref: 'ChatLink',
    index: true
  },
  sender: {
    type: String,
    required: true,
    enum: ['admin', 'client']
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);