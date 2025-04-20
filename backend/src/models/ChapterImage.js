const mongoose = require('mongoose');

const chapterImageSchema = new mongoose.Schema({
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  image_url: { type: String, required: true },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChapterImage', chapterImageSchema);