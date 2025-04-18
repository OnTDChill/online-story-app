const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  chapterId: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);