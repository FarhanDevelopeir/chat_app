// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   deviceId: {
//     type: String,
//     required: true
//   },
//   isOnline: {
//     type: Boolean,
//     default: false
//   },
//   lastSeen: {
//     type: Date,
//     default: Date.now
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('User', UserSchema);



const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: false // Only required for admin-created users
  },
  deviceId: { 
    type: String, 
    required: true 
  },
  isOnline: { 
    type: Boolean, 
    default: false 
  },
  lastSeen: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Optional: simple string comparison (insecure)
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model('User', UserSchema);
