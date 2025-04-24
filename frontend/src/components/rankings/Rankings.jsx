import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaHeart, FaStar, FaChartLine, FaCalendarAlt, FaBookOpen } from 'react-icons/fa';

/**
 * Rankings - Trang bảng xếp hạng truyện
 */
const Rankings = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('views'); // views, likes, rating
  const [timeRange, setTimeRange] = useState('all'); // all, week, month
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Lấy dữ liệu truyện
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}stories/rankings`, {
          params: { type: activeTab, timeRange }
        });
        
        if (response.status === 200) {
          setStories(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bảng xếp hạng:', error);
        
        // Dữ liệu mẫu để test
        setStories(generateSampleStories(activeTab, timeRange));
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [activeTab, timeRange]);

  // Tạo dữ liệu mẫu để test
  const generateSampleStories = (type, timeRange) => {
    const statuses = ['ongoing', 'completed'];
    const genreNames = ['Hành động', 'Tình cảm', 'Kinh dị', 'Hài hước', 'Phiêu lưu'];
    
    // Tạo giá trị ngẫu nhiên dựa trên loại xếp hạng
    const getRandomValue = (type) => {
      switch (type) {
        case 'views':
          return Math.floor(Math.random() * 100000) + 10000;
        case 'likes':
          return Math.floor(Math.random() * 10000) + 1000;
        case 'rating':
          return (Math.random() * 2 + 3).toFixed(1); // Rating từ 3.0 đến 5.0
        default:
          return 0;
      }
    };
    
    // Điều chỉnh giá trị dựa trên khoảng thời gian
    const adjustValueByTimeRange = (value, timeRange) => {
      switch (timeRange) {
        case 'week':
          return Math.floor(value * 0.2); // 20% của tổng
        case 'month':
          return Math.floor(value * 0.5); // 50% của tổng
        default:
          return value;
      }
    };
    
    return Array.from({ length: 20 }, (_, i) => {
      const value = getRandomValue(type);
      const adjustedValue = adjustValueByTimeRange(value, timeRange);
      
      return {
        _id: `story-${i + 1}`,
        title: `Truyện xếp hạng ${i + 1}`,
        author: `Tác giả ${Math.floor(i / 3) + 1}`,
        description: `Mô tả cho truyện mẫu ${i + 1}. Đây là một truyện rất hay và hấp dẫn với nhiều tình tiết bất ngờ.`,
        genre: genreNames[Math.floor(Math.random() * genreNames.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        views: type === 'views' ? adjustedValue : Math.floor(Math.random() * 10000),
        likes: type === 'likes' ? adjustedValue : Math.floor(Math.random() * 1000),
        rating: type === 'rating' ? adjustedValue : (Math.random() * 2 + 3).toFixed(1),
        chapters: Math.floor(Math.random() * 100) + 1,
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        thumbnail: `https://picsum.photos/id/${i + 10}/300/400`
      };
    }).sort((a, b) => {
      // Sắp xếp theo loại xếp hạng
      switch (type) {
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  };

  // Lấy icon cho loại xếp hạng
  const getRankingIcon = (type) => {
    switch (type) {
      case 'views':
        return <FaEye className="mr-2" />;
      case 'likes':
        return <FaHeart className="mr-2" />;
      case 'rating':
        return <FaStar className="mr-2" />;
      default:
        return null;
    }
  };

  // Lấy tiêu đề cho loại xếp hạng
  const getRankingTitle = (type) => {
    switch (type) {
      case 'views':
        return 'Lượt xem';
      case 'likes':
        return 'Lượt thích';
      case 'rating':
        return 'Đánh giá';
      default:
        return '';
    }
  };

  // Lấy tiêu đề cho khoảng thời gian
  const getTimeRangeTitle = (range) => {
    switch (range) {
      case 'week':
        return 'Tuần này';
      case 'month':
        return 'Tháng này';
      case 'all':
        return 'Tất cả';
      default:
        return '';
    }
  };

  // Format số lượng
  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    } else {
      return number;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FaChartLine className="mr-2" /> Bảng xếp hạng
        </h1>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 px-4 font-medium text-center ${
            activeTab === 'views'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('views')}
        >
          <FaEye className="inline mr-2" /> Lượt xem
        </button>
        <button
          className={`flex-1 py-3 px-4 font-medium text-center ${
            activeTab === 'likes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('likes')}
        >
          <FaHeart className="inline mr-2" /> Lượt thích
        </button>
        <button
          className={`flex-1 py-3 px-4 font-medium text-center ${
            activeTab === 'rating'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('rating')}
        >
          <FaStar className="inline mr-2" /> Đánh giá
        </button>
      </div>
      
      {/* Time Range Filter */}
      <div className="bg-gray-100 p-3 flex justify-center space-x-4">
        <button
          className={`px-4 py-1 rounded-full ${
            timeRange === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTimeRange('all')}
        >
          <FaCalendarAlt className="inline mr-1" /> Tất cả
        </button>
        <button
          className={`px-4 py-1 rounded-full ${
            timeRange === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTimeRange('month')}
        >
          <FaCalendarAlt className="inline mr-1" /> Tháng này
        </button>
        <button
          className={`px-4 py-1 rounded-full ${
            timeRange === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTimeRange('week')}
        >
          <FaCalendarAlt className="inline mr-1" /> Tuần này
        </button>
      </div>
      
      {/* Rankings List */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          {getRankingIcon(activeTab)} {getRankingTitle(activeTab)} - {getTimeRangeTitle(timeRange)}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story, index) => (
              <div 
                key={story._id} 
                className="flex bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="w-12 bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {index + 1}
                </div>
                <div className="w-20 h-28">
                  <img 
                    src={story.thumbnail} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-3">
                  <Link to={`/story/${story._id}`} className="font-semibold text-lg hover:text-blue-600">
                    {story.title}
                  </Link>
                  <p className="text-sm text-gray-600 mb-2">{story.author}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <span className="flex items-center mr-3">
                      <FaEye className="mr-1" />
                      {formatNumber(story.views)}
                    </span>
                    <span className="flex items-center mr-3">
                      <FaHeart className="mr-1 text-red-500" />
                      {formatNumber(story.likes)}
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
        )}
      </div>
    </div>
  );
};

export default Rankings;
