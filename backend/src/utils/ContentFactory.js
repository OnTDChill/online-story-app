const Story = require('../models/Story');
const Chapter = require('../models/Chapter');

class ContentFactory {
  createStory(type, data) {
    switch (type) {
      case 'normal':
        return new Story({
          title: data.title,
          description: data.description,
          author: data.author,
          genre: data.genre,
          thumbnail: data.thumbnail,
          number_of_chapters: data.number_of_chapters,
          status: data.status || 'ongoing'
        });
      case 'vip':
        return new Story({
          title: data.title,
          description: data.description,
          author: data.author,
          genre: data.genre,
          thumbnail: data.thumbnail,
          number_of_chapters: data.number_of_chapters,
          status: data.status || 'ongoing',
          isVip: true
        });
      default:
        throw new Error('Loại truyện không hợp lệ!');
    }
  }

  createChapter(type, data) {
    switch (type) {
      case 'text':
        return new Chapter({
          story_id: data.story_id,
          chapter_number: data.chapter_number,
          title: data.title,
          content: data.content
        });
      case 'image':
        return new Chapter({
          story_id: data.story_id,
          chapter_number: data.chapter_number,
          title: data.title,
          content: data.content,
          hasImages: true
        });
      default:
        throw new Error('Loại chương không hợp lệ!');
    }
  }
}

module.exports = new ContentFactory();