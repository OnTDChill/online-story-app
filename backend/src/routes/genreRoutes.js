const express = require('express');
const router = express.Router();
const { createGenre, getGenres, getGenreById, updateGenre, deleteGenre, getStoriesByGenre } = require('../controllers/genreController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyAdmin, createGenre);
router.get('/', getGenres);
router.get('/:id', getGenreById);
router.put('/:id', verifyToken, verifyAdmin, updateGenre);
router.delete('/:id', verifyToken, verifyAdmin, deleteGenre);
router.get('/:genreName/stories', getStoriesByGenre);

module.exports = router;