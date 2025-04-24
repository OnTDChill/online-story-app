import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaHeart, FaBookmark, FaStar, FaChevronRight } from 'react-icons/fa';
import MangaSection from './MangaSection';

/**
 * HomePage - Trang chủ của ứng dụng
 */
const HomePage = () => {
  const [featuredStories, setFeaturedStories] = useState([]);
  const [latestStories, setLatestStories] = useState([]);
  const [popularStories, setPopularStories] = useState([]);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Lấy dữ liệu truyện
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy truyện nổi bật
        const featuredResponse = await axios.get(`${API_URL}stories/featured`);

        // Lấy truyện mới cập nhật
        const latestResponse = await axios.get(`${API_URL}stories/latest`);

        // Lấy truyện phổ biến
        const popularResponse = await axios.get(`${API_URL}stories/popular`);

        // Lấy truyện đã hoàn thành
        const completedResponse = await axios.get(`${API_URL}stories/completed`);

        if (featuredResponse.status === 200) {
          setFeaturedStories(featuredResponse.data);
        }

        if (latestResponse.status === 200) {
          setLatestStories(latestResponse.data);
        }

        if (popularResponse.status === 200) {
          setPopularStories(popularResponse.data);
        }

        if (completedResponse.status === 200) {
          setCompletedStories(completedResponse.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu truyện:', error);

        // Dữ liệu mẫu để test
        setFeaturedStories(generateSampleStories(5));
        setLatestStories(generateSampleStories(10));
        setPopularStories(generateSampleStories(10));
        setCompletedStories(generateSampleStories(10));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tạo dữ liệu mẫu để test
  const generateSampleStories = (count) => {
    const statuses = ['ongoing', 'completed'];
    const genreNames = ['Hành động', 'Tình cảm', 'Kinh dị', 'Hài hước', 'Phiêu lưu'];

    return Array.from({ length: count }, (_, i) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      return {
        _id: `story-${i + 1}`,
        title: `Truyện mẫu ${i + 1}`,
        author: `Tác giả ${Math.floor(i / 3) + 1}`,
        description: `Mô tả cho truyện mẫu ${i + 1}. Đây là một truyện rất hay và hấp dẫn với nhiều tình tiết bất ngờ.`,
        genre: genreNames[Math.floor(Math.random() * genreNames.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 1000),
        rating: (Math.random() * 2 + 3).toFixed(1), // Rating từ 3.0 đến 5.0
        chapters: Math.floor(Math.random() * 100) + 1,
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: createdAt.toISOString(),
        thumbnail: `https://picsum.photos/id/${i + 10}/300/400`
      };
    });
  };

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
                      to={`/story/${featuredStories[0]._id}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Đọc ngay
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bảng xếp hạng */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Bảng xếp hạng</h2>
              <Link to="/rankings" className="text-blue-600 hover:underline flex items-center">
                Xem tất cả <FaChevronRight className="ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularStories.slice(0, 6).map((story, index) => (
                <div key={story._id} className="bg-white rounded-lg shadow-md overflow-hidden flex">
                  <div className="w-10 bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
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
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{story.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{story.author}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="flex items-center mr-3">
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
              ))}
            </div>
          </section>

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
                        <Link to={`/story/${story._id}`} className="flex items-center">
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
                        <Link to={`/story/${story._id}/chapter/${story.chapters}`} className="text-blue-600 hover:underline">
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

          {/* Truyện mẫu One Piece */}
          <MangaSection
            title="Truyện mẫu"
            subtitle="Truyện được tải từ dữ liệu local"
          />

          {/* Truyện Doraemon */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Doraemon</h2>
              <Link to="/doraemon" className="text-blue-600 hover:underline flex items-center">
                Xem chi tiết <FaChevronRight className="ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/4 p-4">
                  <img
                    src="/data/manga/doraemon/cover.jpg"
                    alt="Doraemon"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="md:w-3/4 p-4">
                  <h3 className="text-xl font-bold mb-2">Doraemon</h3>
                  <p className="text-gray-700 mb-4">
                    Doraemon là một chú mèo máy được gửi ngược về quá khứ từ thế kỷ 22 bởi cháu trai của Nobita để giúp đỡ ông mình sống một cuộc đời hạnh phúc hơn. Doraemon có một chiếc túi thần kỳ với vô số bảo bối từ tương lai.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Hài hước</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Khoa học viễn tưởng</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Đời thường</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Phiêu lưu</span>
                  </div>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      4.9
                    </span>
                    <span className="flex items-center">
                      <FaEye className="mr-1" />
                      15,000
                    </span>
                    <span>27 tập</span>
                  </div>
                  <Link
                    to="/doraemon"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Đọc ngay
                  </Link>
                </div>
              </div>
            </div>
          </section>

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
                  <p className="text-sm text-gray-500">{Math.floor(Math.random() * 100) + 10} truyện</p>
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
