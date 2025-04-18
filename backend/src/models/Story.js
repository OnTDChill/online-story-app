const mongoose = require('mongoose');
const Chapter = require('./Chapter');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  thumbnail: { type: String },
  number_of_chapters: { type: Number, required: true },
  latest_chapter: { type: Number, default: 0 },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  isVip: { type: Boolean, default: false }
}, { timestamps: true });

storySchema.pre('findOneAndDelete', async function (next) {
  try {
    const story = await this.model.findOne(this.getQuery());
    if (!story) return next();
    await Chapter.deleteMany({ story_id: story._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Story', storySchema);