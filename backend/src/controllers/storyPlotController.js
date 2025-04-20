const StoryPlot = require('../models/StoryPlot');
const Story = require('../models/Story');

// Get all story plots
const getStoryPlots = async (req, res) => {
  try {
    const { page = 1, limit = 10, storyId } = req.query;
    const query = {};
    
    if (storyId) {
      query.story = storyId;
    }
    
    const plots = await StoryPlot.find(query)
      .populate('story', 'title author')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await StoryPlot.countDocuments(query);
    
    res.json({ plots, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific story plot
const getStoryPlotById = async (req, res) => {
  try {
    const plot = await StoryPlot.findById(req.params.id)
      .populate('story', 'title author');
      
    if (!plot) {
      return res.status(404).json({ message: 'Story plot not found' });
    }
    
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new story plot
const createStoryPlot = async (req, res) => {
  try {
    const { 
      storyId, 
      plotPoints, 
      mainCharacters, 
      settings, 
      themes, 
      notes 
    } = req.body;
    
    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if plot already exists for this story
    const existingPlot = await StoryPlot.findOne({ story: storyId });
    if (existingPlot) {
      return res.status(400).json({ message: 'A plot already exists for this story' });
    }
    
    const newPlot = new StoryPlot({
      story: storyId,
      plotPoints: plotPoints || [],
      mainCharacters: mainCharacters || [],
      settings: settings || [],
      themes: themes || [],
      notes: notes || ''
    });
    
    await newPlot.save();
    res.status(201).json({ message: 'Story plot created successfully', plot: newPlot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a story plot
const updateStoryPlot = async (req, res) => {
  try {
    const { 
      plotPoints, 
      mainCharacters, 
      settings, 
      themes, 
      notes 
    } = req.body;
    
    const plot = await StoryPlot.findById(req.params.id);
    if (!plot) {
      return res.status(404).json({ message: 'Story plot not found' });
    }
    
    if (plotPoints) plot.plotPoints = plotPoints;
    if (mainCharacters) plot.mainCharacters = mainCharacters;
    if (settings) plot.settings = settings;
    if (themes) plot.themes = themes;
    if (notes !== undefined) plot.notes = notes;
    
    await plot.save();
    res.json({ message: 'Story plot updated successfully', plot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a story plot
const deleteStoryPlot = async (req, res) => {
  try {
    const plot = await StoryPlot.findById(req.params.id);
    if (!plot) {
      return res.status(404).json({ message: 'Story plot not found' });
    }
    
    await StoryPlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story plot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStoryPlots,
  getStoryPlotById,
  createStoryPlot,
  updateStoryPlot,
  deleteStoryPlot
};