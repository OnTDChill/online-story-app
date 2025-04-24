/**
 * StoryFilterContext - Lớp ngữ cảnh cho việc lọc truyện
 * Triển khai Strategy Pattern
 */
class StoryFilterContext {
  constructor() {
    this.strategies = [];
  }

  /**
   * Thêm chiến lược lọc
   * @param {StoryFilterStrategy} strategy - Chiến lược lọc cần thêm
   * @returns {StoryFilterContext} Instance hiện tại để hỗ trợ method chaining
   */
  addStrategy(strategy) {
    this.strategies.push(strategy);
    return this;
  }

  /**
   * Xóa tất cả chiến lược lọc
   * @returns {StoryFilterContext} Instance hiện tại để hỗ trợ method chaining
   */
  clearStrategies() {
    this.strategies = [];
    return this;
  }

  /**
   * Thực hiện lọc với tất cả chiến lược đã thêm
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  executeFilter(stories, criteria) {
    if (!stories || !Array.isArray(stories)) {
      console.error('Dữ liệu truyện không hợp lệ');
      return [];
    }
    
    // Nếu không có chiến lược nào, trả về danh sách ban đầu
    if (this.strategies.length === 0) {
      return stories;
    }
    
    // Áp dụng lần lượt các chiến lược lọc
    let filteredStories = [...stories];
    
    for (const strategy of this.strategies) {
      filteredStories = strategy.filter(filteredStories, criteria);
    }
    
    return filteredStories;
  }

  /**
   * Lấy danh sách các chiến lược lọc hiện tại
   * @returns {Array} Danh sách chiến lược lọc
   */
  getStrategies() {
    return this.strategies;
  }
}

export default StoryFilterContext;
