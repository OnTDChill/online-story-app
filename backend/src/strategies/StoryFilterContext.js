/**
 * StoryFilterContext - Context cho Strategy Pattern
 * Sử dụng các chiến lược lọc truyện
 */
class StoryFilterContext {
  constructor() {
    this.strategies = [];
  }

  /**
   * Thêm chiến lược lọc
   * @param {StoryFilterStrategy} strategy - Chiến lược lọc
   */
  addStrategy(strategy) {
    this.strategies.push(strategy);
  }

  /**
   * Xóa tất cả chiến lược lọc
   */
  clearStrategies() {
    this.strategies = [];
  }

  /**
   * Áp dụng tất cả chiến lược lọc
   * @param {Object} query - Query MongoDB
   * @param {Object} filterParams - Tham số lọc
   * @returns {Object} Query đã được áp dụng tất cả bộ lọc
   */
  applyFilters(query, filterParams) {
    let filteredQuery = { ...query };
    
    for (const strategy of this.strategies) {
      filteredQuery = strategy.applyFilter(filteredQuery, filterParams);
    }
    
    return filteredQuery;
  }
}

module.exports = StoryFilterContext;
