const ReadingProgressManager = require('../utils/ReadingProgressManager');

const updateProgress = async (req, res) => {
  const { userId, storyId, chapterId } = req.body;

  try {
    ReadingProgressManager.updateProgress(userId, storyId, chapterId);
    res.json({ message: 'Cập nhật tiến trình thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const getProgress = async (req, res) => {
  try {
    const progress = ReadingProgressManager.getProgress(req.params.userId, req.params.storyId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

module.exports = { updateProgress, getProgress };