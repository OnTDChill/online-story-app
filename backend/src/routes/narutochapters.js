const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const mongoose = require('mongoose');

// API endpoint để lấy danh sách chương của truyện Naruto
router.get('/', async (req, res) => {
  try {
    console.log('Getting Naruto chapters');
    
    // Chuyển đổi ID thành ObjectId
    const storyId = new mongoose.Types.ObjectId('6807722cf2d1107e375d6e9d');
    
    // Tìm các chương của truyện Naruto
    const chapters = await Chapter.find({ story: storyId }).sort({ chapter_number: 1 });
    console.log('Found Naruto chapters:', chapters.length);
    
    // Trả về kết quả
    res.json(chapters);
  } catch (error) {
    console.error('Error getting Naruto chapters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
