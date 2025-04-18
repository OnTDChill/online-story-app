const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const StoryFacade = require('../utils/StoryFacade');

const createStory = async (req, res) => {
  try {
    const newStory = await StoryFacade.createStory(req.body, req.file);
    res.status(201).json({ message: 'Truyện đã được tạo thành công!', story: newStory });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo truyện!', error: error.message });
  }
};

const getStories = async (req, res) => {
  try {
    const stories = await Story.find();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ message: 'Truyện không tồn tại!' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, author, genre, number_of_chapters, status } = req.body;

    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ message: 'Truyện không tồn tại!' });

    story.title = title || story.title;
    story.description = description || story.description;
    story.author = author || story.author;
    story.genre = genre || story.genre;
    story.number_of_chapters = number_of_chapters || story.number_of_chapters;
    story.status = status || story.status;

    await story.save();
    res.json({ message: 'Cập nhật truyện thành công!', story });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Invalid story ID!' });
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ message: 'Truyện không tồn tại!' });
    }

    await Story.findByIdAndDelete(id);
    res.json({ message: 'Xóa truyện thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const getChaptersByStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: 'Truyện không tồn tại!' });
    
    const response = await Chapter.find({ story_id: storyId }).populate('story_id', 'title');    
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

module.exports = { createStory, getStories, getStoryById, updateStory, deleteStory, getChaptersByStory };