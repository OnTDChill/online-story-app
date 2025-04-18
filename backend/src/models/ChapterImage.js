const mongoose = require('mongoose');

const chapterImageSchema = new mongoose.Schema({
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  image_url: { type: String, required: true },
  image_order: { type: Number, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('ChapterImage', chapterImageSchema);