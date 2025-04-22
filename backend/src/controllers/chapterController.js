const Chapter = require('../models/Chapter');
const StoryFacade = require('../utils/StoryFacade');

const createChapter = async (req, res) => {
  try {
    const storyFacade = new StoryFacade();
    const chapter = await storyFacade.addChapter(req.params.storyId, req.body);
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chương không tồn tại!' });
    }
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const getNarutoChapters = async (req, res) => {
  try {
    console.log('Getting Naruto chapters from chapterController.js');

    // Chuyển đổi ID thành ObjectId
    const mongoose = require('mongoose');
    const storyId = new mongoose.Types.ObjectId('6807722cf2d1107e375d6e9d');

    // Tìm các chương của truyện Naruto
    const chapters = await Chapter.find({ story: storyId }).sort({ chapter_number: 1 });
    console.log('Found Naruto chapters:', chapters.length);

    // Trả về kết quả
    res.json(chapters);
  } catch (error) {
    console.error('Error getting Naruto chapters:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createChapter, getChapterById, getNarutoChapters };