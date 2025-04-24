import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaHeart, FaStar, FaBookOpen, FaFilter, FaCalendarAlt } from 'react-icons/fa';

/**
 * NewStories - Trang truyện mới cập nhật
 */
const NewStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Lấy dữ liệu truyện
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}stories/new`, {
          params: { 
            timeRange: filter,
            page: currentPage,
            limit: 10
          }
        });
        
        if (response.status === 200) {
          setStories(response.data.stories);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu truyện mới:', error);
        
        // Dữ liệu mẫu để test
        const sampleData = generateSampleStories(filter);
        setStories(sampleData.stories);
        setTotalPages(sampleData.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [filter, currentPage]);

  // Tạo dữ liệu mẫu để test
  const generateSampleStories = (timeRange) => {
    const statuses = ['ongoing', 'completed'];
    const genreNames = ['Hành động', 'Tình cảm', 'Kinh dị', 'Hài hước', 'Phiêu lưu'];
    
    // Tạo ngày dựa trên khoảng thời gian
    const getDateByTimeRange = (timeRange) => {
      const now = new Date();
      switch (timeRange) {
        case 'today':
          return new Date(now.setHours(0, 0, 0, 0));
        case 'week':
          return new Date(now.setDate(now.getDate() - 7));
        case 'month':
          return new Date(now.setMonth(now.getMonth() - 1));
        default:
          return new Date(now.setFullYear(now.getFullYear() - 1));
      }
    };
    
    const minDate = getDateByTimeRange(timeRange);
    
    // Tạo danh sách truyện
    const allStories = Array.from({ length: 50 }, (_, i) => {
      const createdAt = new Date();
      // Tạo ngày ngẫu nhiên trong khoảng thời gian
      createdAt.setTime(minDate.getTime() + Math.random() * (Date.now() - minDate.getTime()));
      
      return {
        _id: `story-${i + 1}`,
        title: `Truyện mới ${i + 1}`,
        author: `Tác giả ${Math.floor(i / 5) + 1}`,
        description: `Mô tả cho truyện mẫu ${i + 1}. Đây là một truyện rất hay và hấp dẫn với nhiều tình tiết bất ngờ.`,
        genre: genreNames[Math.floor(Math.random() * genreNames.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        rating: (Math.random() * 2 + 3).toFixed(1), // Rating từ 3.0 đến 5.0
        chapters: Math.floor(Math.random() * 100) + 1,
        createdAt: createdAt.toISOString(),
        updatedAt: new Date(createdAt.getTime() + Math.random() * 86400000).toISOString(), // Cập nhật trong vòng 1 ngày sau khi tạo
        thumbnail: `https://picsum.photos/id/${i + 30}/300/400`
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Phân trang
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedStories = allStories.slice(startIndex, endIndex);
    
    return {
      stories: paginatedStories,
      totalPages: Math.ceil(allStories.length / 10)
    };
  };

  // Format thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Lấy tiêu đề cho bộ lọc
  const getFilterTitle = (filter) => {
    switch (filter) {
      case 'today':
        return 'Hôm nay';
      case 'week':
        return 'Tuần này';
      case 'month':
        return 'Tháng này';
      default:
        return 'Tất cả';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FaCalendarAlt className="mr-2" /> Truyện mới cập nhật
        </h1>
      </div>
      
      {/* Filter */}
      <div className="bg-gray-100 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <FaFilter className="text-gray-600 mr-2" />
          <span className="text-gray-700 font-medium">Lọc theo:</span>
        </div>
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('today')}
          >
            Hôm nay
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('week')}
          >
            Tuần này
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('month')}
          >
            Tháng này
          </button>
        </div>
      </div>
      
      {/* Stories List */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Truyện mới cập nhật - {getFilterTitle(filter)}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {stories.map((story) => (
                <div 
                  key={story._id} 
                  className="flex bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-32">
                    <img 
                      src={story.thumbnail} 
                      alt={story.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/story/${story._id}`} className="font-semibold text-lg hover:text-blue-600">
                          {story.title}
                        </Link>
                        <p className="text-sm text-gray-600">{story.author}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(story.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 my-2 line-clamp-2">
                      {story.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <span className="flex items-center mr-3">
                        <FaEye className="mr-1" />
                        {story.views.toLocaleString()}
                      </span>
                      <span className="flex items-center mr-3">
                        <FaHeart className="mr-1 text-red-500" />
                        {story.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center mr-3">
                        <FaStar className="mr-1 text-yellow-500" />
                        {story.rating}
                      </span>
                      <span className="flex items-center">
                        <FaBookOpen className="mr-1" />
                        {story.chapters} chương
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full mr-2">
                        {story.genre}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        story.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {story.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
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

export default NewStories;
