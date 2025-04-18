const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  nickname: {
    type: String,
    default: ''
  },
  quote: {
    type: String,
    default: ''
  },
  ruby: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 0
  },
  svipPoints: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: ''
  },
  refCode: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'Thành Viên'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);