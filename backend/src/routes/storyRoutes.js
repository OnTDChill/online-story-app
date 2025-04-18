const express = require('express');
const router = express.Router();
const { createStory, getStories, getStoryById, updateStory, deleteStory, getChaptersByStory } = require('../controllers/storyController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const storyThumbnailUpload = require('../middleware/storyThumbnailUpload');

router.post('/', verifyToken, verifyAdmin, storyThumbnailUpload.single('thumbnail'), createStory);
router.get('/', getStories);
router.get('/:id', getStoryById);
router.put('/:id', verifyToken, verifyAdmin, updateStory);
router.delete('/:id', verifyToken, verifyAdmin, deleteStory);
router.get('/:storyId/chapters', getChaptersByStory);

module.exports = router;