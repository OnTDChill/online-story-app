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

module.exports = { createChapter, getChapterById };