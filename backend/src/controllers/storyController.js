const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const StoryFacade = require('../utils/StoryFacade');

const createStory = async (req, res) => {
  const { title, description, author, genre, number_of_chapters, status, type } = req.body;
  const thumbnail = req.file ? req.file.filename : null;
  try {
    const facade = new StoryFacade();
    const story = await facade.createStory({ title, description, author, genre, number_of_chapters, status, type, thumbnail });
    res.json({ message: 'Story created successfully', story });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getStories = async (req, res) => {
  const { search, genre, author, status, sort, page = 1, limit = 10, mode } = req.query;
  const query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (genre) query.genre = genre;
  if (author) query.author = { $regex: author, $options: 'i' };
  if (status) query.status = status;
  if (mode === 'original') query.type = 'normal';
  if (mode === 'translated') query.type = 'vip';

  const sortOptions = {};
  if (sort === 'latest') sortOptions.createdAt = -1;
  if (sort === 'popular' || mode === 'ranking') sortOptions.views = -1;

  try {
    const stories = await Story.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Story.countDocuments(query);
    res.json({ stories, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getChaptersByStory = async (req, res) => {
  try {
    const chapters = await Chapter.find({ story: req.params.id });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createStory, getStories, getStoryById, getChaptersByStory };