const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Member' },
  avatar: { type: String },
  diamonds: { type: Number, default: 0 },
  rubies: { type: Number, default: 0 },
  svipPoints: { type: Number, default: 0 },
  favoriteQuote: { type: String },
  nickname: { type: String },
  personalLink: { type: String }
}, { timestamps: true });

userSchema.index({ email: 1 }); // Thêm index cho email

module.exports = mongoose.model('User', userSchema);