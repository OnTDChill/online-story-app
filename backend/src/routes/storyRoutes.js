const express = require('express');
const { createStory, getStories, getStoryById, getChaptersByStory } = require('../controllers/storyController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createStory);
router.get('/', getStories);
router.get('/:id', getStoryById);
router.get('/:storyId/chapters', getChaptersByStory);

module.exports = router;