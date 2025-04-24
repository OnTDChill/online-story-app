/**
 * StoryFilterStrategy - Interface cho các chiến lược lọc truyện
 * Triển khai Strategy Pattern
 */
class StoryFilterStrategy {
  constructor() {
    if (this.constructor === StoryFilterStrategy) {
      throw new Error("Abstract class 'StoryFilterStrategy' cannot be instantiated directly");
    }
  }

  /**
   * Áp dụng bộ lọc vào query
   * @param {Object} query - Query MongoDB
   * @param {Object} filterParams - Tham số lọc
   * @returns {Object} Query đã được áp dụng bộ lọc
   */
  applyFilter(query, filterParams) {
    throw new Error("Method 'applyFilter' must be implemented");
  }
}

/**
 * GenreFilterStrategy - Chiến lược lọc theo thể loại
 */
class GenreFilterStrategy extends StoryFilterStrategy {
  applyFilter(query, filterParams) {
    const { genre } = filterParams;
    if (genre && genre !== 'all') {
      query.genre = genre;
    }
    return query;
  }
}

/**
 * StatusFilterStrategy - Chiến lược lọc theo trạng thái
 */
class StatusFilterStrategy extends StoryFilterStrategy {
  applyFilter(query, filterParams) {
    const { status } = filterParams;
    if (status && status !== 'all') {
      query.status = status;
    }
    return query;
  }
}

/**
 * TypeFilterStrategy - Chiến lược lọc theo loại truyện (normal/vip)
 */
class TypeFilterStrategy extends StoryFilterStrategy {
  applyFilter(query, filterParams) {
    const { type } = filterParams;
    if (type && type !== 'all') {
      query.type = type;
    }
    return query;
  }
}

/**
 * SearchFilterStrategy - Chiến lược lọc theo từ khóa tìm kiếm
 */
class SearchFilterStrategy extends StoryFilterStrategy {
  applyFilter(query, filterParams) {
    const { search } = filterParams;
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    return query;
  }
}

/**
 * DateFilterStrategy - Chiến lược lọc theo ngày tạo
 */
class DateFilterStrategy extends StoryFilterStrategy {
  applyFilter(query, filterParams) {
    const { startDate, endDate } = filterParams;
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    return query;
  }
}

/**
 * ViewsFilterStrategy - Chiến lược lọc theo số lượt xem
 */
class ViewsFilterStrategy extends StoryFilterStrategy {
  applyFilter(query, filterParams) {
    const { minViews, maxViews } = filterParams;
    if (minViews || maxViews) {
      query.views = {};
      
      if (minViews) {
        query.views.$gte = parseInt(minViews);
      }
      
      if (maxViews) {
        query.views.$lte = parseInt(maxViews);
      }
    }
    return query;
  }
}

module.exports = {
  StoryFilterStrategy,
  GenreFilterStrategy,
  StatusFilterStrategy,
  TypeFilterStrategy,
  SearchFilterStrategy,
  DateFilterStrategy,
  ViewsFilterStrategy
};
