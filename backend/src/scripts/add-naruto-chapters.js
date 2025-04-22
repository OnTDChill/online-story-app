require('dotenv').config();
const mongoose = require('mongoose');
const Chapter = require('../models/Chapter');

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // ID của truyện Naruto
    const narutostoryId = '6807722cf2d1107e375d6e9d';
    
    // Tạo 10 chương cho truyện Naruto
    const chapters = [];
    for (let i = 1; i <= 10; i++) {
      chapters.push({
        story: narutostoryId,
        chapter_number: i,
        title: `Chương ${i}`,
        content: `Nội dung chương ${i} của truyện Naruto`
      });
    }
    
    try {
      // Xóa các chương cũ của truyện Naruto (nếu có)
      await Chapter.deleteMany({ story: narutostoryId });
      console.log('Deleted old Naruto chapters');
      
      // Thêm các chương mới
      const result = await Chapter.insertMany(chapters);
      console.log(`Added ${result.length} new Naruto chapters`);
    } catch (error) {
      console.error('Error adding Naruto chapters:', error);
    }
    
    // Ngắt kết nối
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
