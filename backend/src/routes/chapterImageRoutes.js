const express = require('express');
const router = express.Router();
const { uploadChapterImages, getChapterImages, updateChapterImage, deleteChapterImage } = require('../controllers/chapterImageController');
const chapterImageUpload = require('../middleware/chapterImageUpload');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyAdmin, chapterImageUpload.array('images', 10), uploadChapterImages);
router.put('/:id', verifyToken, verifyAdmin, chapterImageUpload.single('image'), updateChapterImage);
router.get('/:chapter_id', verifyToken, getChapterImages);
router.delete('/:id', verifyToken, verifyAdmin, deleteChapterImage);

module.exports = router;