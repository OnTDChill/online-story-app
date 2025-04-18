const mongoose = require('mongoose');
const ChapterImage = require('./ChapterImage');

const chapterSchema = new mongoose.Schema({
  story_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  chapter_number: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  hasImages: { type: Boolean, default: false }
}, { timestamps: true });

chapterSchema.pre('findOneAndDelete', async function (next) {
  try {
    const query = this.getQuery();
    if (!query._id) {
      return next(new Error('Không tìm thấy _id trong truy vấn để xóa chương!'));
    }

    await ChapterImage.deleteMany({ chapter_id: query._id });

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Chapter', chapterSchema);