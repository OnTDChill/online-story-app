const mongoose = require('mongoose');
const Chapter = require('./Chapter');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  thumbnail: { type: String },
  views: { type: Number, default: 0 },
  status: { type: String, default: 'Hành động' },
  type: { type: String, default: 'normal' },
  number_of_chapters: { type: Number, required: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

storySchema.pre('findOneAndDelete', async function (next) {
  await Chapter.deleteMany({ story: this._conditions._id });
  next();
});

storySchema.index({ genre: 1, author: 1 });

module.exports = mongoose.model('Story', storySchema);