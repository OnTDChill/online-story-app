const ListState = require('./ListState');

class NormalListState extends ListState {
  async fetchStories(params) {
    const { search, genre, author, status, sort, page, limit } = params;
    const response = await this.context.axios.get('http://localhost:5000/api/stories', {
      params: { search, genre, author, status, sort, page, limit }
    });
    return response.data;
  }

  getTitle() {
    return 'Danh Sách Truyện';
  }
}

module.exports = NormalListState;