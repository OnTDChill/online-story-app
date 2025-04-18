const express = require('express');
const router = express.Router();
const { addChapter, getChapterById, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyAdmin, addChapter);
router.get('/:id', getChapterById);
router.put('/:id', verifyToken, verifyAdmin, updateChapter);
router.delete('/:id', verifyToken, verifyAdmin, deleteChapter);

module.exports = router;