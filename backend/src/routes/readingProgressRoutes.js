const express = require('express');
const { updateProgress, getProgress } = require('../controllers/readingProgressController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, updateProgress);
router.get('/:userId/:storyId', authMiddleware, getProgress);

module.exports = router;