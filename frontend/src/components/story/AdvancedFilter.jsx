import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import MangaService from '../../services/MangaService';
import StoryFilterContext from '../../patterns/StoryFilterContext';
import {
  GenreFilterStrategy,
  StatusFilterStrategy,
  TypeFilterStrategy,
  SearchFilterStrategy,
  DateFilterStrategy,
  ViewsFilterStrategy
} from '../../patterns/StoryFilterStrategy';

/**
 * Component lọc truyện nâng cao
 * Sử dụng Strategy Pattern
 */
const AdvancedFilter = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [searchParams] = useSearchParams();
  const [filterCriteria, setFilterCriteria] = useState({
    genre: '',
    status: '',
    type: '',
    search: searchParams.get('search') || '',
    startDate: '',
    endDate: '',
    minViews: '',
    maxViews: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Lấy danh sách truyện và thể loại
  useEffect(() => {
    fetchStories();
    fetchGenres();
  }, []);

  // Áp dụng tìm kiếm từ URL khi component được tải
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilterCriteria(prev => ({ ...prev, search: searchQuery }));
      // Áp dụng tìm kiếm tự động nếu có tham số search trong URL
      setTimeout(() => {
        handleApplyFilter();
      }, 500);
    }
  }, [searchParams]);

  // Lấy danh sách truyện từ MangaService
  const fetchStories = async () => {
    setLoading(true);
    try {
      console.log('AdvancedFilter: Fetching manga list...');
      const data = await MangaService.getMangas();

      if (Array.isArray(data)) {
        console.log('AdvancedFilter: Received manga data:', data.length, 'items');

        // Đảm bảo mỗi manga có đủ thông tin cần thiết
        const processedData = data.map(manga => ({
          ...manga,
          _id: manga._id || manga.id || `manga-${Math.random().toString(36).substr(2, 9)}`,
          title: manga.title || 'Untitled Manga',
          author: manga.author || 'Unknown Author',
          thumbnail: manga.thumbnail || '/placeholder-image.jpg',
          genre: manga.genre || (manga.genres && manga.genres.length > 0 ? manga.genres[0] : 'Manga'),
          status: manga.status || 'ongoing',
          views: manga.views || 0,
          rating: manga.rating || 5.0,
          chapters: manga.chapters || 1
        }));

        setStories(processedData);
        setFilteredStories(processedData);
      } else {
        console.error('AdvancedFilter: Data is not an array:', data);
        toast.error('Không thể lấy danh sách truyện');

        // Dữ liệu mẫu để test
        const sampleData = generateSampleStories();
        setStories(sampleData);
        setFilteredStories(sampleData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách truyện:', error);
      toast.error('Lỗi khi lấy danh sách truyện');

      // Dữ liệu mẫu để test
      const sampleData = generateSampleStories();
      setStories(sampleData);
      setFilteredStories(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách thể loại từ API
  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API_URL}genres`);
      if (response.status === 200) {
        setGenres(response.data);
      } else {
        console.warn('Không thể lấy danh sách thể loại từ API, sử dụng dữ liệu mẫu');
        setGenresFromManga();
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thể loại:', error);
      setGenresFromManga();
    }
  };

  // Tạo danh sách thể loại từ manga đã tải
  const setGenresFromManga = () => {
    // Lấy tất cả thể loại từ truyện
    const genreSet = new Set();

    stories.forEach(story => {
      if (story.genre) {
        genreSet.add(story.genre);
      }
      if (story.genres && Array.isArray(story.genres)) {
        story.genres.forEach(g => genreSet.add(g));
      }
    });

    // Nếu không có thể loại nào, sử dụng dữ liệu mẫu
    if (genreSet.size === 0) {
      setGenres([
        { _id: '1', name: 'Hành động' },
        { _id: '2', name: 'Tình cảm' },
        { _id: '3', name: 'Kinh dị' },
        { _id: '4', name: 'Hài hước' },
        { _id: '5', name: 'Phiêu lưu' },
        { _id: '6', name: 'Manga' }
      ]);
    } else {
      // Chuyển đổi Set thành mảng các đối tượng genre
      const genreArray = Array.from(genreSet).map((name, index) => ({
        _id: `genre-${index + 1}`,
        name
      }));

      setGenres(genreArray);
    }
  };

  // Tạo dữ liệu mẫu để test
  const generateSampleStories = () => {
    const statuses = ['ongoing', 'completed'];
    const types = ['normal', 'vip'];
    const genreNames = ['Hành động', 'Tình cảm', 'Kinh dị', 'Hài hước', 'Phiêu lưu'];

    return Array.from({ length: 20 }, (_, i) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));

      return {
        _id: `story-${i + 1}`,
        title: `Truyện mẫu ${i + 1}`,
        author: `Tác giả ${Math.floor(i / 4) + 1}`,
        description: `Mô tả cho truyện mẫu ${i + 1}`,
        genre: genreNames[Math.floor(Math.random() * genreNames.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
        views: Math.floor(Math.random() * 10000),
        createdAt: createdAt.toISOString(),
        thumbnail: `https://via.placeholder.com/150?text=Story${i + 1}`
      };
    });
  };

  // Xử lý thay đổi tiêu chí lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria({
      ...filterCriteria,
      [name]: value
    });
  };

  // Xử lý áp dụng bộ lọc
  const handleApplyFilter = () => {
    // Tạo context và thêm các chiến lược lọc
    const filterContext = new StoryFilterContext();

    // Thêm các chiến lược lọc dựa trên tiêu chí đã chọn
    if (filterCriteria.genre) {
      filterContext.addStrategy(new GenreFilterStrategy());
    }

    if (filterCriteria.status) {
      filterContext.addStrategy(new StatusFilterStrategy());
    }

    if (filterCriteria.type) {
      filterContext.addStrategy(new TypeFilterStrategy());
    }

    if (filterCriteria.search) {
      filterContext.addStrategy(new SearchFilterStrategy());
    }

    if (filterCriteria.startDate || filterCriteria.endDate) {
      filterContext.addStrategy(new DateFilterStrategy());
    }

    if (filterCriteria.minViews || filterCriteria.maxViews) {
      filterContext.addStrategy(new ViewsFilterStrategy());
    }

    // Thực hiện lọc
    const result = filterContext.executeFilter(stories, filterCriteria);
    setFilteredStories(result);

    toast.info(`Đã tìm thấy ${result.length} truyện phù hợp`);
  };

  // Xử lý đặt lại bộ lọc
  const handleResetFilter = () => {
    setFilterCriteria({
      genre: '',
      status: '',
      type: '',
      search: '',
      startDate: '',
      endDate: '',
      minViews: '',
      maxViews: ''
    });
    setFilteredStories(stories);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Tìm kiếm truyện nâng cao</h2>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tìm kiếm */}
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              name="search"
              value={filterCriteria.search}
              onChange={handleFilterChange}
              placeholder="Tên truyện, tác giả..."
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Thể loại */}
          <div>
            <label className="block text-sm font-medium mb-1">Thể loại</label>
            <select
              name="genre"
              value={filterCriteria.genre}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Tất cả thể loại</option>
              {genres.map(genre => (
                <option key={genre._id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              name="status"
              value={filterCriteria.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ongoing">Đang tiến hành</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>

          {/* Loại truyện */}
          <div>
            <label className="block text-sm font-medium mb-1">Loại truyện</label>
            <select
              name="type"
              value={filterCriteria.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Tất cả loại</option>
              <option value="normal">Thường</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          {/* Từ ngày */}
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              value={filterCriteria.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Đến ngày */}
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              value={filterCriteria.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Lượt xem tối thiểu */}
          <div>
            <label className="block text-sm font-medium mb-1">Lượt xem tối thiểu</label>
            <input
              type="number"
              name="minViews"
              value={filterCriteria.minViews}
              onChange={handleFilterChange}
              placeholder="Nhập số lượt xem"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Lượt xem tối đa */}
          <div>
            <label className="block text-sm font-medium mb-1">Lượt xem tối đa</label>
            <input
              type="number"
              name="maxViews"
              value={filterCriteria.maxViews}
              onChange={handleFilterChange}
              placeholder="Nhập số lượt xem"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Nút lọc */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleResetFilter}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Đặt lại
          </button>
          <button
            onClick={handleApplyFilter}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Kết quả */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Kết quả tìm kiếm ({filteredStories.length})</h3>

        {loading ? (
          <div className="text-center py-8">Đang tải dữ liệu...</div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStories.map(story => (
              <div key={story._id} className="bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={story.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-1 truncate">{story.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">Tác giả: {story.author}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {story.genre}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      story.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {story.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{story.views} lượt xem</span>
                    <span>{story.type === 'vip' ? 'VIP' : 'Thường'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Không tìm thấy truyện phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilter;
