/**
 * StoryFilterStrategy - Lớp cơ sở cho các chiến lược lọc truyện
 * Triển khai Strategy Pattern
 */
class StoryFilterStrategy {
  constructor() {
    if (this.constructor === StoryFilterStrategy) {
      throw new Error("Lớp trừu tượng 'StoryFilterStrategy' không thể được khởi tạo trực tiếp");
    }
  }

  /**
   * Lọc danh sách truyện theo tiêu chí
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  filter(stories, criteria) {
    throw new Error("Phương thức 'filter' phải được triển khai bởi lớp con");
  }
}

/**
 * GenreFilterStrategy - Chiến lược lọc theo thể loại
 */
export class GenreFilterStrategy extends StoryFilterStrategy {
  /**
   * Lọc truyện theo thể loại
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  filter(stories, criteria) {
    if (!criteria.genre || criteria.genre === 'all') {
      return stories;
    }
    return stories.filter(story => story.genre === criteria.genre);
  }
}

/**
 * StatusFilterStrategy - Chiến lược lọc theo trạng thái
 */
export class StatusFilterStrategy extends StoryFilterStrategy {
  /**
   * Lọc truyện theo trạng thái
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  filter(stories, criteria) {
    if (!criteria.status || criteria.status === 'all') {
      return stories;
    }
    return stories.filter(story => story.status === criteria.status);
  }
}

/**
 * TypeFilterStrategy - Chiến lược lọc theo loại truyện (normal/vip)
 */
export class TypeFilterStrategy extends StoryFilterStrategy {
  /**
   * Lọc truyện theo loại
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  filter(stories, criteria) {
    if (!criteria.type || criteria.type === 'all') {
      return stories;
    }
    return stories.filter(story => story.type === criteria.type);
  }
}

/**
 * SearchFilterStrategy - Chiến lược lọc theo từ khóa tìm kiếm
 */
export class SearchFilterStrategy extends StoryFilterStrategy {
  /**
   * Lọc truyện theo từ khóa tìm kiếm
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  filter(stories, criteria) {
    if (!criteria.search || criteria.search.trim() === '') {
      return stories;
    }
    
    const searchLower = criteria.search.toLowerCase();
    
    return stories.filter(story => 
      (story.title && story.title.toLowerCase().includes(searchLower)) || 
      (story.author && story.author.toLowerCase().includes(searchLower)) ||
      (story.description && story.description.toLowerCase().includes(searchLower))
    );
  }
}

/**
 * DateFilterStrategy - Chiến lược lọc theo ngày tạo
 */
export class DateFilterStrategy extends StoryFilterStrategy {
  /**
   * Lọc truyện theo ngày tạo
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  filter(stories, criteria) {
    if (!criteria.startDate && !criteria.endDate) {
      return stories;
    }
    
    return stories.filter(story => {
      const storyDate = new Date(story.createdAt);
      
      if (criteria.startDate && criteria.endDate) {
        const startDate = new Date(criteria.startDate);
        const endDate = new Date(criteria.endDate);
        return storyDate >= startDate && storyDate <= endDate;
      } else if (criteria.startDate) {
        const startDate = new Date(criteria.startDate);
        return storyDate >= startDate;
      } else if (criteria.endDate) {
        const endDate = new Date(criteria.endDate);
        return storyDate <= endDate;
      }
      
      return true;
    });
  }
}

/**
 * ViewsFilterStrategy - Chiến lược lọc theo số lượt xem
 */
export class ViewsFilterStrategy extends StoryFilterStrategy {
  /**
   * Lọc truyện theo số lượt xem
   * @param {Array} stories - Danh sách truyện cần lọc
   * @param {Object} criteria - Tiêu chí lọc
   * @returns {Array} Danh sách truyện đã lọc
   */
  filter(stories, criteria) {
    if (!criteria.minViews && !criteria.maxViews) {
      return stories;
    }
    
    return stories.filter(story => {
      const views = story.views || 0;
      
      if (criteria.minViews && criteria.maxViews) {
        return views >= criteria.minViews && views <= criteria.maxViews;
      } else if (criteria.minViews) {
        return views >= criteria.minViews;
      } else if (criteria.maxViews) {
        return views <= criteria.maxViews;
      }
      
      return true;
    });
  }
}

export default StoryFilterStrategy;
