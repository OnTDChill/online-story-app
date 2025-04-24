import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BasicGenre, GenreWithCountDecorator, GenreWithPopularityDecorator, createFullGenre } from '../../patterns/GenreDecorator';

/**
 * Component hiển thị danh sách thể loại
 * Sử dụng Decorator Pattern
 */
const GenreList = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('basic'); // 'basic', 'withCount', 'withPopularity', 'full'

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Lấy danh sách thể loại
  useEffect(() => {
    fetchGenres();
  }, []);

  // Lấy danh sách thể loại từ API
  const fetchGenres = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}genres`);
      if (response.status === 200) {
        // Lấy số lượng truyện cho mỗi thể loại
        const genresWithCount = await fetchGenreCounts(response.data);
        setGenres(genresWithCount);
      } else {
        toast.error('Không thể lấy danh sách thể loại');
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thể loại:', error);
      
      // Dữ liệu mẫu để test
      const sampleData = generateSampleGenres();
      setGenres(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Lấy số lượng truyện cho mỗi thể loại
  const fetchGenreCounts = async (genreList) => {
    try {
      const response = await axios.get(`${API_URL}genres/counts`);
      if (response.status === 200) {
        const countMap = response.data.reduce((map, item) => {
          map[item.genre] = item.count;
          return map;
        }, {});
        
        return genreList.map(genre => ({
          ...genre,
          count: countMap[genre.name] || 0,
          popularity: Math.min(5, Math.floor(Math.random() * 5) + 1) // Giả lập độ phổ biến
        }));
      }
      return genreList.map(genre => ({
        ...genre,
        count: 0,
        popularity: Math.min(5, Math.floor(Math.random() * 5) + 1)
      }));
    } catch (error) {
      console.error('Lỗi khi lấy số lượng truyện:', error);
      return genreList.map(genre => ({
        ...genre,
        count: Math.floor(Math.random() * 100),
        popularity: Math.min(5, Math.floor(Math.random() * 5) + 1)
      }));
    }
  };

  // Tạo dữ liệu mẫu để test
  const generateSampleGenres = () => {
    const genreNames = [
      'Hành động', 'Tình cảm', 'Kinh dị', 'Hài hước', 'Phiêu lưu',
      'Khoa học viễn tưởng', 'Thể thao', 'Đời thường', 'Lịch sử', 'Trinh thám'
    ];
    
    return genreNames.map((name, index) => ({
      _id: `genre-${index + 1}`,
      name,
      count: Math.floor(Math.random() * 100),
      popularity: Math.min(5, Math.floor(Math.random() * 5) + 1)
    }));
  };

  // Xử lý thay đổi chế độ hiển thị
  const handleDisplayModeChange = (e) => {
    setDisplayMode(e.target.value);
  };

  // Lấy tên hiển thị cho thể loại dựa trên chế độ hiển thị
  const getDisplayName = (genre) => {
    switch (displayMode) {
      case 'basic':
        return new BasicGenre(genre).getName();
      
      case 'withCount':
        return new GenreWithCountDecorator(new BasicGenre(genre))
          .setStoryCount(genre.count)
          .getName();
      
      case 'withPopularity':
        return new GenreWithPopularityDecorator(new BasicGenre(genre))
          .setPopularity(genre.popularity)
          .getName();
      
      case 'full':
        return createFullGenre(genre, genre.count, genre.popularity).getName();
      
      default:
        return genre.name;
    }
  };

  // Lấy thông tin hiển thị cho thể loại
  const getGenreInfo = (genre) => {
    switch (displayMode) {
      case 'basic':
        return new BasicGenre(genre).getInfo();
      
      case 'withCount':
        return new GenreWithCountDecorator(new BasicGenre(genre))
          .setStoryCount(genre.count)
          .getInfo();
      
      case 'withPopularity':
        return new GenreWithPopularityDecorator(new BasicGenre(genre))
          .setPopularity(genre.popularity)
          .getInfo();
      
      case 'full':
        return createFullGenre(genre, genre.count, genre.popularity).getInfo();
      
      default:
        return { id: genre._id, name: genre.name };
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Danh sách thể loại</h2>
        
        <div className="flex items-center">
          <label className="mr-2">Chế độ hiển thị:</label>
          <select
            value={displayMode}
            onChange={handleDisplayModeChange}
            className="p-2 border rounded"
          >
            <option value="basic">Cơ bản</option>
            <option value="withCount">Với số lượng truyện</option>
            <option value="withPopularity">Với độ phổ biến</option>
            <option value="full">Đầy đủ</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map(genre => {
            const genreInfo = getGenreInfo(genre);
            
            return (
              <div key={genre._id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{getDisplayName(genre)}</h3>
                
                {displayMode !== 'basic' && (
                  <div className="mt-2 text-sm text-gray-600">
                    {genreInfo.storyCount !== undefined && (
                      <p>Số truyện: {genreInfo.storyCount}</p>
                    )}
                    
                    {genreInfo.popularity !== undefined && (
                      <p>Độ phổ biến: {genreInfo.popularity}/5</p>
                    )}
                  </div>
                )}
                
                <button className="mt-3 text-blue-500 hover:text-blue-700 text-sm">
                  Xem truyện
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GenreList;
