const express = require('express');
const { createStory, getStories, getStoryById, getChaptersByStory } = require('../controllers/storyController');
const authMiddleware = require('../middleware/authMiddleware');
const storyThumbnailUpload = require('../middleware/storyThumbnailUpload');
const router = express.Router();

// Simple test route for debugging
router.post('/test', (req, res) => {
  console.log('Test route - req.body:', req.body);
  res.json({ message: 'Test route received', body: req.body });
});

// Direct approach for story creation
router.post('/', authMiddleware, (req, res) => {
  // This is a workaround for the form data issue
  res.json({
    message: 'Please use the /api/new-stories endpoint for story creation',
    redirectTo: '/api/new-stories'
  });
});

// New route with proper multipart handling
router.post('/with-upload',
  authMiddleware,
  storyThumbnailUpload.single('thumbnail'),
  (req, res, next) => {
    console.log('Middleware check - req.body:', req.body);
    console.log('Middleware check - req.file:', req.file);
    next();
  },
  createStory
);
router.get('/', getStories);
router.get('/:id', getStoryById);
router.get('/:id/chapters', getChaptersByStory);

module.exports = router;