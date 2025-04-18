const ReadingProgress = require('../models/ReadingProgress');
const ReadingProgressManager = require('../utils/ReadingProgressManager');

const getProgress = async (req, res) => {
  try {
    const { userId, storyId } = req.params;

    // Kiểm tra quyền truy cập
    if (req.user._id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập!' });
    }

    // Lấy tiến trình từ cache
    const progress = ReadingProgressManager.getProgress(userId, storyId);
    res.json({ message: 'Lấy tiến trình thành công!', progress });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { userId, storyId, chapterId } = req.body;

    // Kiểm tra quyền truy cập
    if (req.user._id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật!' });
    }

    // Cập nhật tiến trình vào cache
    ReadingProgressManager.updateProgress(userId, storyId, chapterId);

    res.json({ message: 'Cập nhật tiến trình thành công!' });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật tiến trình!', error: error.message });
  }
};

module.exports = { getProgress, updateProgress };