const express = require('express');
const { createChapter, getChapterById, getNarutoChapters } = require('../controllers/chapterController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// API endpoint đặc biệt cho truyện Naruto
router.get('/naruto/all', getNarutoChapters);

// Các route khác
router.post('/:storyId', authMiddleware, createChapter);
router.get('/:id', getChapterById);

module.exports = router;