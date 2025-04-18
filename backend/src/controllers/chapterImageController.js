const path = require('path');
const ChapterImage = require('../models/ChapterImage');
const fs = require('fs');
const Chapter = require('../models/Chapter');
const Story = require('../models/Story');

exports.uploadChapterImages = async (req, res) => {
  try {
    const { chapter_id } = req.body;

    const chapter = await Chapter.findById(chapter_id);
    if (!chapter) return res.status(404).json({ message: 'Chapter không tồn tại!' });

    const story = await Story.findById(chapter.story_id);
    if (!story) return res.status(404).json({ message: 'Story không tồn tại!' });

    const storyTitle = story.title.trim().replace(/\s+/g, '_');
    const chapterNumber = chapter.chapter_number;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Chưa có hình ảnh nào được tải lên!' });
    }

    const destDir = path.join(__dirname, '..', 'uploads', storyTitle, String(chapterNumber));
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const lastImage = await ChapterImage.findOne({ chapter_id }).sort('-image_order');
    let nextOrder = lastImage ? lastImage.image_order + 1 : 1;

    const uploadedImages = [];
    for (const file of req.files) {
      const tmpPath = file.path;
      const destPath = path.join(destDir, file.filename);

      fs.renameSync(tmpPath, destPath);

      const newImage = new ChapterImage({
        chapter_id,
        image_url: `/uploads/${storyTitle}/${chapterNumber}/${file.filename}`,
        image_order: nextOrder++,
      });
      await newImage.save();
      uploadedImages.push(newImage);
    }

    res.status(201).json({ message: 'Tải ảnh lên thành công!', images: uploadedImages });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

exports.getChapterImages = async (req, res) => {
  try {
    const { chapter_id } = req.params;
    const images = await ChapterImage.find({ chapter_id }).sort('image_order').populate('chapter_id', 'title');
    res.json({ images });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

exports.updateChapterImage = async (req, res) => {
  try {
    const { id } = req.params;
    const newFile = req.file;

    if (!newFile) {
      return res.status(400).json({ message: 'Chưa có hình ảnh mới!' });
    }

    const chapterImage = await ChapterImage.findById(id).populate('chapter_id');
    if (!chapterImage) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh!' });
    }

    const chapter = chapterImage.chapter_id;
    const story = await Story.findById(chapter.story_id);
    const storyTitle = story.title.trim().replace(/\s+/g, '_');
    const chapterNumber = chapter.chapter_number;

    const destDir = path.join(__dirname, '..', 'Uploads', storyTitle, String(chapterNumber));
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const oldImagePath = path.join(__dirname, '..', chapterImage.image_url);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    const tmpPath = newFile.path;
    const destPath = path.join(destDir, newFile.filename);
    fs.renameSync(tmpPath, destPath);

    chapterImage.image_url = `/uploads/${storyTitle}/${chapterNumber}/${newFile.filename}`;
    await chapterImage.save();

    res.json({ message: 'Cập nhật ảnh thành công!', image: chapterImage });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

exports.deleteChapterImage = async (req, res) => {
  try {
    const { id } = req.params;
    const chapterImage = await ChapterImage.findById(id);
    if (!chapterImage) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh!' });
    }

    const imagePath = path.join(__dirname, '..', chapterImage.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await ChapterImage.findByIdAndDelete(id);

    res.json({ message: 'Xóa ảnh thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};