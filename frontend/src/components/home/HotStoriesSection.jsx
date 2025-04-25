import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaEye } from 'react-icons/fa';
import MangaService from '../../services/MangaService';

/**
 * HotStoriesSection - Hiển thị danh sách truyện hot
 */
const HotStoriesSection = () => {
  const [hotStories, setHotStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotStories = async () => {
      try {
        // Lấy tất cả truyện từ MangaService
        const allMangas = await MangaService.getMangas();
        console.log('Fetched all mangas for hot stories:', allMangas.length);

        if (allMangas && allMangas.length > 0) {
          // Sắp xếp theo lượt xem hoặc rating để lấy truyện hot
          const sortedMangas = [...allMangas].sort((a, b) => {
            // Ưu tiên truyện có rating cao
            const ratingDiff = (b.rating || 0) - (a.rating || 0);
            if (Math.abs(ratingDiff) > 0.5) return ratingDiff;

            // Nếu rating tương đương, xét đến lượt xem
            return (b.views || 0) - (a.views || 0);
          });

          // Lấy tối đa 5 truyện hot nhất
          const topMangas = sortedMangas.slice(0, 5);
          console.log('Selected top mangas:', topMangas.length);

          setHotStories(topMangas);
        } else {
          console.log('No mangas found for hot stories');
          setHotStories([]);
        }
      } catch (error) {
        console.error('Error fetching hot stories:', error);
        setHotStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotStories();
  }, []);

  // Lấy thể loại từ manga
  const getGenre = (manga) => {
    if (manga.genre) return manga.genre.split(',')[0];
    if (manga.genres && Array.isArray(manga.genres) && manga.genres.length > 0) return manga.genres[0];
    return 'Manga';
  };

  // Format số lượt xem
  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-2">🔥</span> Truyện Hot
          </h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-2">🔥</span> Truyện Hot
        </h2>
      </div>

      <div className="space-y-3">
        {hotStories.map((story, index) => (
          <Link
            key={story._id}
            to={`/manga/${story._id}`}
            className="flex items-center bg-white bg-opacity-10 hover:bg-opacity-20 p-3 rounded-lg transition-all"
          >
            <div className="flex-shrink-0 relative">
              <div className="absolute top-0 left-0 w-6 h-6 bg-red-600 text-white flex items-center justify-center rounded-tl-md rounded-br-md font-bold text-sm">
                {index + 1}
              </div>
              <img
                src={story.thumbnail}
                alt={story.title}
                className="w-16 h-20 object-cover rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150x200?text=No+Image';
                }}
              />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-white font-medium">{story.title}</h3>
              <div className="flex items-center mt-1 justify-between">
                <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-0.5 rounded-full">
                  {getGenre(story)}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-yellow-300 text-xs">
                    <FaStar className="mr-1" />
                    <span>{story.rating || 5.0}</span>
                  </div>
                  <div className="flex items-center text-white text-xs">
                    <FaEye className="mr-1" />
                    <span>{formatViews(story.views)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-3 text-center">
        <Link
          to="/advanced-filter"
          className="inline-block text-white hover:underline text-sm font-medium"
        >
          Xem thêm
        </Link>
      </div>
    </div>
  );
};

export default HotStoriesSection;
