const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { port, nodeEnv } = require('./src/config/env');
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

const app = express();
app.use(cors());
app.use(express.json());

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

// Sử dụng các routes
app.use('/api/user', authRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/chapter-images', chapterImageRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/progress', readingProgressRoutes);

// Phục vụ tệp tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Route mẫu
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from back-end!' });
});

// Xử lý lỗi
app.use(errorHandler);

// Lưu tiến trình đọc định kỳ (mỗi 5 phút)
setInterval(() => {
  ReadingProgressManager.saveProgressToDatabase(ReadingProgress);
}, 5 * 60 * 1000);

app.listen(port, () => console.log(`Server running on port ${port} in ${nodeEnv} mode`));