const express = require('express');
const { createChapterImage, getImagesByChapter } = require('../controllers/chapterImageController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createChapterImage);
router.get('/:chapter_id', getImagesByChapter);

module.exports = router;