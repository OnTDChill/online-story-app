import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaHeart, FaStar, FaBookOpen, FaFilter, FaCheck, FaSort } from 'react-icons/fa';

/**
 * CompletedStories - Trang truyện đã hoàn thành
 */
const CompletedStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // latest, views, rating
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showGenreFilter, setShowGenreFilter] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Lấy dữ liệu truyện và thể loại
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách thể loại
        const genresResponse = await axios.get(`${API_URL}genres`);
        
        // Lấy danh sách truyện hoàn thành
        const storiesResponse = await axios.get(`${API_URL}stories/completed`, {
          params: { 
            genre: selectedGenre !== 'all' ? selectedGenre : undefined,
            sortBy,
            page: currentPage,
            limit: 12
          }
        });
        
        if (genresResponse.status === 200) {
          setGenres(genresResponse.data);
        }
        
        if (storiesResponse.status === 200) {
          setStories(storiesResponse.data.stories);
          setTotalPages(storiesResponse.data.totalPages);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu truyện hoàn thành:', error);
        
        // Dữ liệu mẫu để test
        const sampleGenres = generateSampleGenres();
        setGenres(sampleGenres);
        
        const sampleData = generateSampleStories(selectedGenre, sortBy, currentPage);
        setStories(sampleData.stories);
        setTotalPages(sampleData.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedGenre, sortBy, currentPage]);

  // Tạo danh sách thể loại mẫu
  const generateSampleGenres = () => {
    return [
      { _id: 'action', name: 'Hành động' },
      { _id: 'romance', name: 'Tình cảm' },
      { _id: 'fantasy', name: 'Kỳ ảo' },
      { _id: 'horror', name: 'Kinh dị' },
      { _id: 'comedy', name: 'Hài hước' },
      { _id: 'adventure', name: 'Phiêu lưu' },
      { _id: 'scifi', name: 'Khoa học viễn tưởng' },
      { _id: 'mystery', name: 'Bí ẩn' },
      { _id: 'drama', name: 'Kịch tính' },
      { _id: 'historical', name: 'Lịch sử' }
    ];
  };

  // Tạo dữ liệu truyện mẫu
  const generateSampleStories = (genre, sortBy, page) => {
    const genreNames = ['Hành động', 'Tình cảm', 'Kỳ ảo', 'Kinh dị', 'Hài hước', 'Phiêu lưu', 'Khoa học viễn tưởng', 'Bí ẩn', 'Kịch tính', 'Lịch sử'];
    
    // Tạo danh sách truyện
    let allStories = Array.from({ length: 100 }, (_, i) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
      
      const storyGenre = genreNames[Math.floor(Math.random() * genreNames.length)];
      
      return {
        _id: `story-${i + 1}`,
        title: `Truyện hoàn thành ${i + 1}`,
        author: `Tác giả ${Math.floor(i / 10) + 1}`,
        description: `Mô tả cho truyện mẫu ${i + 1}. Đây là một truyện rất hay và hấp dẫn với nhiều tình tiết bất ngờ.`,
        genre: storyGenre,
        status: 'completed',
        views: Math.floor(Math.random() * 50000) + 5000,
        likes: Math.floor(Math.random() * 5000) + 500,
        rating: (Math.random() * 2 + 3).toFixed(1), // Rating từ 3.0 đến 5.0
        chapters: Math.floor(Math.random() * 200) + 50,
        createdAt: createdAt.toISOString(),
        updatedAt: new Date(createdAt.getTime() + Math.random() * 86400000 * 30).toISOString(), // Cập nhật trong vòng 30 ngày sau khi tạo
        thumbnail: `https://picsum.photos/id/${i + 50}/300/400`
      };
    });
    
    // Lọc theo thể loại nếu có
    if (genre !== 'all') {
      const genreObj = generateSampleGenres().find(g => g._id === genre);
      if (genreObj) {
        allStories = allStories.filter(story => story.genre === genreObj.name);
      }
    }
    
    // Sắp xếp
    switch (sortBy) {
      case 'views':
        allStories.sort((a, b) => b.views - a.views);
        break;
      case 'rating':
        allStories.sort((a, b) => b.rating - a.rating);
        break;
      case 'latest':
      default:
        allStories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
    }
    
    // Phân trang
    const itemsPerPage = 12;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStories = allStories.slice(startIndex, endIndex);
    
    return {
      stories: paginatedStories,
      totalPages: Math.ceil(allStories.length / itemsPerPage)
    };
  };

  // Lấy tiêu đề cho sắp xếp
  const getSortTitle = (sortBy) => {
    switch (sortBy) {
      case 'views':
        return 'Lượt xem';
      case 'rating':
        return 'Đánh giá';
      case 'latest':
      default:
        return 'Mới nhất';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FaCheck className="mr-2" /> Truyện đã hoàn thành
        </h1>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-100 p-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Genre Filter */}
          <div className="relative mb-3 md:mb-0">
            <button 
              className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50"
              onClick={() => setShowGenreFilter(!showGenreFilter)}
            >
              <FaFilter className="mr-2 text-gray-600" />
              <span className="font-medium">
                Thể loại: {selectedGenre === 'all' ? 'Tất cả' : genres.find(g => g._id === selectedGenre)?.name || 'Tất cả'}
              </span>
            </button>
            
            {showGenreFilter && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <button
                    className={`w-full text-left px-3 py-2 rounded ${
                      selectedGenre === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedGenre('all');
                      setShowGenreFilter(false);
                      setCurrentPage(1);
                    }}
                  >
                    Tất cả
                  </button>
                  
                  {genres.map((genre) => (
                    <button
                      key={genre._id}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedGenre === genre._id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedGenre(genre._id);
                        setShowGenreFilter(false);
                        setCurrentPage(1);
                      }}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sort Options */}
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                sortBy === 'latest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => {
                setSortBy('latest');
                setCurrentPage(1);
              }}
            >
              <FaSort className="inline mr-1" /> Mới nhất
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                sortBy === 'views'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => {
                setSortBy('views');
                setCurrentPage(1);
              }}
            >
              <FaEye className="inline mr-1" /> Lượt xem
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                sortBy === 'rating'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => {
                setSortBy('rating');
                setCurrentPage(1);
              }}
            >
              <FaStar className="inline mr-1" /> Đánh giá
            </button>
          </div>
        </div>
      </div>
      
      {/* Stories Grid */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Truyện hoàn thành - {selectedGenre === 'all' ? 'Tất cả thể loại' : genres.find(g => g._id === selectedGenre)?.name || 'Tất cả'} - Sắp xếp theo {getSortTitle(sortBy)}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stories.map((story) => (
                <div 
                  key={story._id} 
                  className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link to={`/story/${story._id}`} className="block relative">
                    <img 
                      src={story.thumbnail} 
                      alt={story.title} 
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1">
                      Hoàn thành
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <div className="flex justify-between text-white text-xs">
                        <span className="flex items-center">
                          <FaEye className="mr-1" />
                          {story.views > 1000 ? `${(story.views / 1000).toFixed(1)}K` : story.views}
                        </span>
                        <span className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          {story.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-2">
                    <Link 
                      to={`/story/${story._id}`} 
                      className="font-medium text-sm hover:text-blue-600 line-clamp-1"
                    >
                      {story.title}
                    </Link>
                    <p className="text-xs text-gray-600 mb-1">{story.author}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        {story.genre}
                      </span>
                      <span className="text-gray-500">
                        {story.chapters} chương
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 py-1">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-full ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))
                  }
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Sau
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompletedStories;
