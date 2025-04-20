const ListState = require('./ListState');

class RankingListState extends ListState {
  async fetchStories(params) {
    const { page, limit } = params;
    const response = await this.context.axios.get('http://localhost:5000/api/stories', {
      params: { mode: 'ranking', page, limit }
    });
    return response.data;
  }

  getTitle() {
    return 'Bảng Xếp Hạng';
  }
}

module.exports = RankingListState;