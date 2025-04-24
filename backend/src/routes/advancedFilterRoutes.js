const express = require('express');
const router = express.Router();
const advancedFilterController = require('../controllers/advancedFilterController');

// Lọc truyện nâng cao
router.get('/stories', advancedFilterController.advancedFilter);

// Lấy các tùy chọn lọc
router.get('/options', advancedFilterController.getFilterOptions);

module.exports = router;
