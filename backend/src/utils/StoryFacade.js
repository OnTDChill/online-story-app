const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const ContentFactory = require('./ContentFactory');
const fs = require('fs');
const path = require('path');

class StoryFacade {
  async createStory(data, file) {
    const { title, description, author, genre, number_of_chapters, status, type = 'normal' } = data;
    if (!title || !author || !genre || !number_of_chapters) {
      throw new Error('Thiếu các trường bắt buộc: title, author, genre, number_of_chapters');
    }
    const parsedChapters = parseInt(number_of_chapters, 10);
    if (isNaN(parsedChapters)) {
      throw new Error('number_of_chapters phải là số!');
    }

    let thumbnailPath = null;
    if (file) {
      const tmpPath = file.path;
      const filename = file.filename;
      const destDir = path.join(__dirname, '..', 'Uploads', 'thumbnails');
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      const destPath = path.join(destDir, filename);
      fs.renameSync(tmpPath, destPath);
      thumbnailPath = filename;
    }

    const newStory = ContentFactory.createStory(type, {
      title,
      description,
      author,
      genre,
      thumbnail: thumbnailPath,
      number_of_chapters: parsedChapters,
      status: status || 'ongoing'
    });
    await newStory.save();

    return newStory;
  }

  async addChapter(storyId, data) {
    const { chapter_number, title, content, type = 'text' } = data;
    if (!storyId || !chapter_number || !title || !content) {
      throw new Error('Thiếu các trường bắt buộc: storyId, chapter_number, title, content');
    }

    const story = await Story.findById(storyId);
    if (!story) {
      throw new Error('Truyện không tồn tại!');
    }

    const newChapter = ContentFactory.createChapter(type, {
      story_id: storyId,
      chapter_number,
      title,
      content
    });
    await newChapter.save();

    story.latest_chapter = Math.max(story.latest_chapter, chapter_number);
    await story.save();

    return newChapter;
  }
}

module.exports = StoryFacade;