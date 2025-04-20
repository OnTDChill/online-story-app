class ListState {
  constructor(context) {
    this.context = context;
  }

  fetchStories() {
    throw new Error('fetchStories() must be implemented');
  }

  getTitle() {
    throw new Error('getTitle() must be implemented');
  }
}

module.exports = ListState;