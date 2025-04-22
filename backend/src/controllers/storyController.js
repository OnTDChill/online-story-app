const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const StoryFacade = require('../utils/StoryFacade');

const createStory = async (req, res) => {
  try {
    // Log the entire request for debugging
    console.log('Request received for story creation');
    console.log('Request body type:', typeof req.body);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers);

    // Check if we have a body at all
    if (!req.body) {
      console.error('No request body found');
      return res.status(400).json({ message: 'Request body is missing' });
    }

    // Create a new story with default values
    const newStory = {
      title: req.body.title || '',
      description: req.body.description || '',
      author: req.body.author || '',
      genre: req.body.genre || '',
      number_of_chapters: req.body.number_of_chapters ? parseInt(req.body.number_of_chapters, 10) : 0,
      status: req.body.status || 'Hành động',
      type: req.body.type || 'normal',
      thumbnail: req.file ? req.file.filename : null,
      isVip: req.body.type === 'vip'
    };

    console.log('Story object to be created:', newStory);

    // Validate required fields
    const missingFields = [];
    if (!newStory.title) missingFields.push('title');
    if (!newStory.author) missingFields.push('author');
    if (!newStory.genre) missingFields.push('genre');
    if (!newStory.number_of_chapters) missingFields.push('number_of_chapters');

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        received: newStory
      });
    }

    // Create and save the story
    const story = new Story(newStory);
    const savedStory = await story.save();
    console.log('Story saved successfully:', savedStory._id);

    res.status(201).json({
      message: 'Story created successfully',
      story: savedStory.toObject()
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({
      message: error.message || 'Server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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