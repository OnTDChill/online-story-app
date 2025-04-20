class ReadingProgressManager {
  constructor() {
    if (!ReadingProgressManager.instance) {
      this.progressCache = new Map();
      ReadingProgressManager.instance = this;
      this.startAutoSave();
    }
    return ReadingProgressManager.instance;
  }

  async loadProgressFromDatabase(db, userId, storyId) {
    const key = `${userId}-${storyId}`;
    const progress = await db.findOne({ user: userId, story: storyId });
    if (progress) {
      this.progressCache.set(key, progress.lastChapter);
    }
    return this.progressCache.get(key) || 0;
  }

  async saveProgressToDatabase(db, userId, storyId, lastChapter) {
    const key = `${userId}-${storyId}`;
    this.progressCache.set(key, lastChapter);
    await db.findOneAndUpdate(
      { user: userId, story: storyId },
      { lastChapter, updatedAt: new Date() },
      { upsert: true }
    );
  }

  updateProgress(userId, storyId, lastChapter) {
    const key = `${userId}-${storyId}`;
    this.progressCache.set(key, lastChapter);
  }

  getProgress(userId, storyId) {
    const key = `${userId}-${storyId}`;
    return this.progressCache.get(key) || 0;
  }

  startAutoSave() {
    setInterval(async () => {
      // Lưu cache vào database (cần inject model ReadingProgress vào instance)
      console.log('Auto-saving progress cache...');
      // TODO: Implement save logic if model is available
    }, 5 * 60 * 1000); // Lưu mỗi 5 phút
  }
}

module.exports = new ReadingProgressManager();