const express = require('express');
const router = express.Router();
const { getGenres, createGenre } = require('../controllers/genreController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getGenres);
router.post('/', authMiddleware, createGenre);

module.exports = router;