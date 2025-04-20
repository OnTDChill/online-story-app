const express = require('express');
const { createChapter, getChapterById } = require('../controllers/chapterController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/:storyId', authMiddleware, createChapter);
router.get('/:id', getChapterById);

module.exports = router;