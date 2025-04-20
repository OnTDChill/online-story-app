const ListState = require('./ListState');

class TranslatedListState extends ListState {
  async fetchStories(params) {
    const { search, genre, author, status, sort, page, limit } = params;
    const response = await this.context.axios.get('http://localhost:5000/api/stories', {
      params: { search, genre, author, status, sort, page, limit, mode: 'translated' }
    });
    return response.data;
  }

  getTitle() {
    return 'Truyện Dịch/Edit';
  }
}

module.exports = TranslatedListState;