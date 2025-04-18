const mongoose = require('mongoose');

class ReadingProgressManager {
  constructor() {
    if (!ReadingProgressManager.instance) {
      this.userProgress = {};
      ReadingProgressManager.instance = this;
    }
    return ReadingProgressManager.instance;
  }

  async loadProgressFromDatabase(db) {
    try {
      const progressRecords = await db.find({}).lean();
      for (const record of progressRecords) {
        const key = `${record.userId}-${record.storyId}`;
        this.userProgress[key] = { chapterId: record.chapterId };
      }
      console.log('Loaded progress from database:', Object.keys(this.userProgress).length, 'records');
    } catch (error) {
      console.error('Error loading progress from database:', error.message);
    }
  }

  getProgress(userId, storyId) {
    const key = `${userId}-${storyId}`;
    return this.userProgress[key] || { chapterId: 1 };
  }

  updateProgress(userId, storyId, chapterId) {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(storyId)) {
      throw new Error('Invalid userId or storyId');
    }
    if (!Number.isInteger(chapterId) || chapterId < 1) {
      throw new Error('chapterId must be a positive integer');
    }

    const key = `${userId}-${storyId}`;
    this.userProgress[key] = { chapterId };
  }

  async saveProgressToDatabase(db) {
    try {
      for (const key in this.userProgress) {
        const [userId, storyId] = key.split('-');
        const progress = this.userProgress[key];

        await db.findOneAndUpdate(
          { userId: new mongoose.Types.ObjectId(userId), storyId: new mongoose.Types.ObjectId(storyId) },
          { chapterId: progress.chapterId },
          { upsert: true }
        );
      }
      console.log('Progress saved to database.');
    } catch (error) {
      console.error('Error saving progress to database:', error.message);
    }
  }
}

const instance = new ReadingProgressManager();
Object.freeze(instance);

module.exports = instance;