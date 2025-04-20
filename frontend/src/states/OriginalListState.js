const ListState = require('./ListState');

class OriginalListState extends ListState {
  async fetchStories(params) {
    const { search, genre, author, status, sort, page, limit } = params;
    const response = await this.context.axios.get('http://localhost:5000/api/stories', {
      params: { search, genre, author, status, sort, page, limit, mode: 'original' }
    });
    return response.data;
  }

  getTitle() {
    return 'Truyện Sáng Tác';
  }
}

module.exports = OriginalListState;