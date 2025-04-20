const ChapterImage = require('../models/ChapterImage');

const createChapterImage = async (req, res) => {
  try {
    const chapterImage = new ChapterImage(req.body);
    await chapterImage.save();
    res.status(201).json(chapterImage);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const getImagesByChapter = async (req, res) => {
  try {
    const images = await ChapterImage.find({ chapter: req.params.chapter_id });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

module.exports = { createChapterImage, getImagesByChapter };