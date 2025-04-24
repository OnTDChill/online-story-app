const Story = require('../models/Story');
const StoryFilterContext = require('../strategies/StoryFilterContext');
const {
  GenreFilterStrategy,
  StatusFilterStrategy,
  TypeFilterStrategy,
  SearchFilterStrategy,
  DateFilterStrategy,
  ViewsFilterStrategy
} = require('../strategies/StoryFilterStrategy');

/**
 * Lọc truyện nâng cao sử dụng Strategy Pattern
 */
const advancedFilter = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'latest',
      genre,
      status,
      type,
      search,
      startDate,
      endDate,
      minViews,
      maxViews
    } = req.query;

    // Tạo context và thêm các chiến lược lọc
    const filterContext = new StoryFilterContext();
    
    // Thêm các chiến lược lọc dựa trên tham số
    filterContext.addStrategy(new GenreFilterStrategy());
    filterContext.addStrategy(new StatusFilterStrategy());
    filterContext.addStrategy(new TypeFilterStrategy());
    filterContext.addStrategy(new SearchFilterStrategy());
    filterContext.addStrategy(new DateFilterStrategy());
    filterContext.addStrategy(new ViewsFilterStrategy());
    
    // Áp dụng tất cả chiến lược lọc
    const filterParams = {
      genre,
      status,
      type,
      search,
      startDate,
      endDate,
      minViews,
      maxViews
    };
    
    const query = filterContext.applyFilters({}, filterParams);
    
    // Tính toán skip và sort
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let sortOption = {};
    
    if (sort === 'popular') {
      sortOption = { views: -1 };
    } else if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'alphabetical') {
      sortOption = { title: 1 };
    }
    
    // Thực hiện truy vấn
    const stories = await Story.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title author genre thumbnail views status type createdAt');
    
    // Đếm tổng số truyện thỏa mãn điều kiện
    const total = await Story.countDocuments(query);
    
    // Trả về kết quả
    res.json({
      stories,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error filtering stories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Lấy các tùy chọn lọc (thể loại, trạng thái, loại)
 */
const getFilterOptions = async (req, res) => {
  try {
    // Lấy tất cả thể loại
    const genres = await Story.distinct('genre');
    
    // Lấy tất cả trạng thái
    const statuses = await Story.distinct('status');
    
    // Lấy tất cả loại
    const types = await Story.distinct('type');
    
    res.json({
      genres,
      statuses,
      types
    });
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  advancedFilter,
  getFilterOptions
};
