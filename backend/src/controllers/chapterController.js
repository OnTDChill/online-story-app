const Chapter = require('../models/Chapter');
const StoryFacade = require('../utils/StoryFacade');

const addChapter = async (req, res) => {
  try {
    const { story_id, chapter_number, title, content } = req.body;
    const newChapter = await StoryFacade.addChapter(story_id, { chapter_number, title, content });
    res.status(201).json({ message: 'Thêm chương thành công!', chapter: newChapter });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi thêm chương!', error: error.message });
  }
};

const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id).populate('story_id', 'title');
    if (!chapter) return res.status(404).json({ message: 'Chương không tồn tại!' });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_number, title, content } = req.body;

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: 'Chương không tồn tại!' });

    chapter.chapter_number = chapter_number || chapter.chapter_number;
    chapter.title = title || chapter.title;
    chapter.content = content || chapter.content;

    await chapter.save();
    res.json({ message: 'Cập nhật chương thành công!', chapter });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: 'Chương không tồn tại!' });

    await Chapter.findByIdAndDelete(id);
    res.json({ message: 'Xóa chương thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

module.exports = { addChapter, getChapterById, updateChapter, deleteChapter };