const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/readingProgressController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:userId/:storyId', verifyToken, getProgress);
router.post('/', verifyToken, updateProgress);

module.exports = router;