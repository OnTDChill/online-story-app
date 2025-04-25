import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaHeart, FaBookmark, FaStar, FaChevronRight } from 'react-icons/fa';
import MangaSection from './MangaSection';
import HotStoriesSection from './HotStoriesSection';
import MangaService from '../../services/MangaService';

/**
 * HomePage - Trang chủ của ứng dụng
 */
const HomePage = () => {
  const [featuredStories, setFeaturedStories] = useState([]);
  const [latestStories, setLatestStories] = useState([]);
  const [popularStories, setPopularStories] = useState([]);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/';

  // Lấy dữ liệu truyện
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách truyện từ thư mục local
        const mangas = await MangaService.getMangas();
        console.log('Loaded mangas from local:', mangas.length);

        if (mangas.length > 0) {
          // Truyện nổi bật - lấy 5 truyện có rating cao nhất
          const featured = [...mangas]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5);
          setFeaturedStories(featured);

          // Truyện mới cập nhật - lấy 10 truyện mới nhất
          const latest = [...mangas]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || Date.now()) -
                           new Date(a.updatedAt || a.createdAt || Date.now()))
            .slice(0, 10);
          setLatestStories(latest);

          // Truyện phổ biến - lấy 10 truyện có lượt xem cao nhất
          const popular = [...mangas]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 10);
          setPopularStories(popular);

          // Truyện đã hoàn thành
          const completed = mangas
            .filter(manga =>
              manga.status === 'Hoàn thành' ||
              manga.status === 'Completed' ||
              manga.status === 'completed'
            )
            .slice(0, 5);

          if (completed.length > 0) {
            setCompletedStories(completed);
          } else {
            // Nếu không có truyện nào đã hoàn thành, lấy 5 truyện bất kỳ
            setCompletedStories(mangas.slice(0, 5));
          }
        } else {
          console.log('No mangas found');
          setFeaturedStories([]);
          setLatestStories([]);
          setPopularStories([]);
          setCompletedStories([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu truyện:', error);
        setFeaturedStories([]);
        setLatestStories([]);
        setPopularStories([]);
        setCompletedStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format thời gian cập nhật
  const formatUpdatedTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'Vừa xong';
    } else if (diffMin < 60) {
      return `${diffMin} phút trước`;
    } else if (diffHour < 24) {
      return `${diffHour} giờ trước`;
    } else if (diffDay < 30) {
      return `${diffDay} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Banner Slider - Truyện nổi bật */}
          <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-80">
              {featuredStories.length > 0 && (
                <>
                  <img
                    src={featuredStories[0].thumbnail}
                    alt={featuredStories[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h2 className="text-3xl font-bold mb-2">{featuredStories[0].title}</h2>
                    <p className="mb-2 line-clamp-2">{featuredStories[0].description}</p>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        {featuredStories[0].rating}
                      </span>
                      <span className="flex items-center">
                        <FaEye className="mr-1" />
                        {featuredStories[0].views.toLocaleString()}
                      </span>
                      <span>{featuredStories[0].genre}</span>
                    </div>
                    <Link
                      to={`/manga/${featuredStories[0]._id}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Đọc ngay
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>



          {/* Truyện mới cập nhật */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Mới cập nhật</h2>
              <Link to="/latest" className="text-blue-600 hover:underline flex items-center">
                Xem tất cả <FaChevronRight className="ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Tên truyện</th>
                    <th className="py-3 px-4 text-left hidden md:table-cell">Thể loại</th>
                    <th className="py-3 px-4 text-left hidden md:table-cell">Chương mới</th>
                    <th className="py-3 px-4 text-left">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {latestStories.slice(0, 10).map((story) => (
                    <tr key={story._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link to={`/manga/${story._id}`} className="flex items-center">
                          <img
                            src={story.thumbnail}
                            alt={story.title}
                            className="w-10 h-14 object-cover rounded mr-3"
                          />
                          <div>
                            <h3 className="font-medium line-clamp-1">{story.title}</h3>
                            <p className="text-sm text-gray-500">{story.author}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {story.genre}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <Link to={`/manga/${story._id}/chapter/${story.chapters}`} className="text-blue-600 hover:underline">
                          Chương {story.chapters}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatUpdatedTime(story.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Truyện manga */}
          <MangaSection
            title="Truyện manga"
            subtitle="Bao gồm truyện Doraemon và các truyện tranh khác"
          />

          {/* Truyện đã hoàn thành */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Truyện đã hoàn thành</h2>
              <Link to="/completed-stories" className="text-blue-600 hover:underline flex items-center">
                Xem tất cả <FaChevronRight className="ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {completedStories.slice(0, 5).map((story) => (
                <div key={story._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={story.thumbnail}
                      alt={story.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1">
                      Hoàn thành
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                      <div className="flex justify-between text-white text-sm">
                        <span className="flex items-center">
                          <FaEye className="mr-1" />
                          {story.views.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          {story.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold mb-1 line-clamp-1">{story.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{story.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {story.genre}
                      </span>
                      <span className="text-xs text-gray-500">
                        {story.chapters} chương
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Thể loại phổ biến */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Thể loại phổ biến</h2>
              <Link to="/genres" className="text-blue-600 hover:underline flex items-center">
                Xem tất cả <FaChevronRight className="ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {['Hành động', 'Tình cảm', 'Kinh dị', 'Hài hước', 'Phiêu lưu', 'Khoa học viễn tưởng', 'Thể thao', 'Đời thường', 'Lịch sử', 'Trinh thám'].map((genre, index) => (
                <Link
                  key={index}
                  to={`/genres/${genre.toLowerCase()}`}
                  className="bg-white rounded-lg shadow-md p-4 text-center hover:bg-blue-50 transition-colors"
                >
                  <h3 className="font-medium">{genre}</h3>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
