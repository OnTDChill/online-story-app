const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  lastChapter: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);