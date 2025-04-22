const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./src/config/db');
const { port, nodeEnv, JWT_SECRET } = require('./src/config/env');
const path = require('path');
const storyThumbnailUpload = require('./src/middleware/storyThumbnailUpload');
const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const chapterRoutes = require('./src/routes/chapterRoutes');
const chapterImageRoutes = require('./src/routes/chapterImageRoutes');
const storyRoutes = require('./src/routes/storyRoutes');
const genreRoutes = require('./src/routes/genreRoutes');
const readingProgressRoutes = require('./src/routes/readingProgressRoutes');
const ReadingProgressManager = require('./src/utils/ReadingProgressManager');
const ReadingProgress = require('./src/models/ReadingProgress');
const adminRoutes = require('./src/routes/adminRoutes');
const narutoChaptersRoutes = require('./src/routes/narutochapters');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow both common React ports
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Kết nối MongoDB
connectDB().then(async () => {
  await ReadingProgressManager.loadProgressFromDatabase(ReadingProgress);
});

// Route tải ảnh
app.post('/api/upload-story-image', storyThumbnailUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const destPath = path.join(__dirname, 'Uploads', 'stories', req.file.filename);
  require('fs').renameSync(req.file.path, destPath);
  res.json({ message: 'File uploaded', filePath: `/uploads/stories/${req.file.filename}` });
});

// API endpoint đặc biệt cho truyện Naruto
app.get('/api/all-chapters', async (req, res) => {
  try {
    console.log('Getting all chapters directly from server.js');

    // Lấy tất cả các chương trong cơ sở dữ liệu
    const Chapter = require('./src/models/Chapter');
    const allChapters = await Chapter.find({}).sort({ chapter_number: 1 });
    console.log('All chapters in database:', allChapters.length);

    // Trả về kết quả
    res.json(allChapters);
  } catch (error) {
    console.error('Error getting all chapters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sử dụng các routes
app.use('/api/user', authRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/chapter-images', chapterImageRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/progress', readingProgressRoutes);
app.use('/api/admin', adminRoutes);

// Phục vụ tệp tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Route mẫu
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from back-end!' });
});



// Simple test endpoint
app.get('/api/test-endpoint', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({ message: 'Test endpoint is working!' });
});

// Simple post test
app.post('/api/test-post', (req, res) => {
  console.log('Test post endpoint accessed');
  console.log('Body:', req.body);
  res.json({ message: 'Test post endpoint is working!', received: req.body });
});

// Working story creation route - no auth required for testing
app.post('/api/create-story', storyThumbnailUpload.single('thumbnail'), async (req, res) => {
  console.log('Story creation request received:');
  console.log('Body:', req.body);
  console.log('File:', req.file);

  try {
    // Extract data from form
    const { title, description, author, genre, number_of_chapters, status, type } = req.body;

    // Validate required fields
    if (!title || !author || !genre || !number_of_chapters) {
      return res.status(400).json({
        message: 'Missing required fields',
        received: { title, author, genre, number_of_chapters }
      });
    }

    // Create new story
    const Story = require('./src/models/Story');
    const story = new Story({
      title,
      description: description || '',
      author,
      genre,
      thumbnail: req.file ? `http://localhost:${port}/uploads/temp/${req.file.filename}` : null,
      number_of_chapters: parseInt(number_of_chapters, 10),
      status: status || 'Hành động',
      type: type || 'normal',
      isVip: type === 'vip'
    });

    // Save to database
    const savedStory = await story.save();
    console.log('Story saved successfully:', savedStory._id);

    // Return success response
    res.status(201).json({
      message: 'Story created successfully',
      story: savedStory
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({
      message: error.message || 'Server error'
    });
  }
});

// Test route for JWT
app.get('/api/test-jwt', (req, res) => {
  try {
    const payload = { test: 'data' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'JWT test successful',
      token: token.substring(0, 20) + '...',
      env: {
        jwtSecretExists: !!JWT_SECRET,
        jwtSecretFirstChars: JWT_SECRET ? JWT_SECRET.substring(0, 3) + '...' : 'N/A'
      }
    });
  } catch (error) {
    console.error('JWT Test Error:', error);
    res.status(500).json({ message: 'JWT test failed', error: error.message });
  }
});

// Xử lý lỗi
app.use(errorHandler);

// Lưu tiến trình đọc định kỳ (mỗi 5 phút)
setInterval(() => {
  ReadingProgressManager.saveProgressToDatabase(ReadingProgress);
}, 5 * 60 * 1000);

app.listen(port, () => console.log(`Server running on port ${port} in ${nodeEnv} mode`));