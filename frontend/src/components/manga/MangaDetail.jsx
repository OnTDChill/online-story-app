import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaStar, FaBookOpen, FaArrowLeft, FaList, FaSync } from 'react-icons/fa';
import MangaService from '../../services/MangaService';

/**
 * Component hiển thị chi tiết truyện manga và danh sách chapter
 * @param {Object} props
 * @param {string} props.mangaId - ID của manga (tùy chọn, nếu không có sẽ lấy từ params)
 */
const MangaDetail = (props) => {
  const params = useParams();
  const mangaId = props.mangaId || params.mangaId;
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy thông tin manga và danh sách chapter
  useEffect(() => {
    const fetchMangaDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching manga details for ID: ${mangaId}`);

        // Xử lý đặc biệt cho truyện Cưa Thủ
        if (mangaId === 'cưa_thủ') {
          console.log('Clearing cache for Cưa Thủ manga');
          // Xóa cache cho truyện Cưa Thủ
          MangaService.clearCache('cưa_thủ');
          MangaService.clearCache('cua_thu');
        }

        // Xử lý đặc biệt cho truyện Cưa Thủ
        if (mangaId === 'cưa_thủ') {
          console.log('Special handling for Cưa Thủ manga');
          try {
            // Lấy thông tin manga từ service
            const mangaInfo = await MangaService.getManga(mangaId);
            if (mangaInfo) {
              console.log('Loaded manga info for Cưa Thủ:', mangaInfo);
              setManga(mangaInfo);
            } else {
              // Nếu không tìm thấy thông tin, tạo thông tin mặc định
              console.log('Creating default info for Cưa Thủ');
              const defaultInfo = {
                _id: 'cưa_thủ',
                title: 'Cưa Thủ',
                author: 'Tatsuki Fujimoto',
                artist: 'Tatsuki Fujimoto',
                description: 'Cưa Thủ kể về Denji, một thanh niên nghèo đang cố trả nợ bằng cách săn quỷ với con quỷ cưa máy của mình. Sau khi bị phản bội và giết chết, anh hợp nhất với con quỷ cưa máy để trở thành Chainsaw Man.',
                genre: 'Hành động',
                genres: ['Hành động', 'Kinh dị', 'Siêu nhiên', 'Phiêu lưu'],
                status: 'Đang tiến hành',
                thumbnail: '/data/manga/cưa_thủ/cover.png',
                type: 'Manga',
                releaseYear: 2018,
                chapters: 97,
                views: 8500,
                rating: 4.8
              };
              setManga(defaultInfo);
            }
          } catch (error) {
            console.error('Error loading Cưa Thủ info:', error);
            // Tạo thông tin mặc định nếu có lỗi
            const defaultInfo = {
              _id: 'cưa_thủ',
              title: 'Cưa Thủ',
              author: 'Tatsuki Fujimoto',
              artist: 'Tatsuki Fujimoto',
              description: 'Cưa Thủ kể về Denji, một thanh niên nghèo đang cố trả nợ bằng cách săn quỷ với con quỷ cưa máy của mình. Sau khi bị phản bội và giết chết, anh hợp nhất với con quỷ cưa máy để trở thành Chainsaw Man.',
              genre: 'Hành động',
              genres: ['Hành động', 'Kinh dị', 'Siêu nhiên', 'Phiêu lưu'],
              status: 'Đang tiến hành',
              thumbnail: '/data/manga/cưa_thủ/cover.png',
              type: 'Manga',
              releaseYear: 2018,
              chapters: 97,
              views: 8500,
              rating: 4.8
            };
            setManga(defaultInfo);
          }
        } else {
          // Xử lý bình thường cho các truyện khác
          const mangaInfo = await MangaService.getManga(mangaId);
          if (!mangaInfo) {
            throw new Error('Không thể tải thông tin truyện');
          }

          console.log('Loaded manga info:', mangaInfo);
          setManga(mangaInfo);
        }

        // Lấy danh sách chapter từ service
        console.log(`Fetching chapters for manga ID: ${mangaId}`);

        // Xử lý đặc biệt cho truyện Cưa Thủ
        if (mangaId === 'cưa_thủ') {
          console.log('Special handling for Cưa Thủ chapters');
          try {
            // Thử lấy chapters từ service
            const chaptersData = await MangaService.getChapters(mangaId);
            console.log('Raw chapters data for Cưa Thủ:', chaptersData);

            if (chaptersData && Array.isArray(chaptersData) && chaptersData.length > 0) {
              // Xử lý chapters từ service
              processChaptersData(chaptersData);
            } else {
              // Tạo chapter mặc định nếu không tìm thấy
              console.log('Creating default chapter for Cưa Thủ');
              const defaultChapters = [
                {
                  _id: 'cưa_thủ-chapter-1',
                  id: '1',
                  number: 1,
                  title: 'Chapter 1',
                  mangaId: 'cưa_thủ',
                  date: new Date().toISOString(),
                  // Thêm đường dẫn đến thư mục chapters/1
                  url: '/data/manga/cưa_thủ/chapters/1'
                }
              ];
              setChapters(defaultChapters);
            }
          } catch (error) {
            console.error('Error loading Cưa Thủ chapters:', error);
            // Tạo chapter mặc định nếu có lỗi
            const defaultChapters = [
              {
                _id: 'cưa_thủ-chapter-1',
                id: '1',
                number: 1,
                title: 'Chapter 1',
                mangaId: 'cưa_thủ',
                date: new Date().toISOString(),
                // Thêm đường dẫn đến thư mục chapters/1
                url: '/data/manga/cưa_thủ/chapters/1'
              }
            ];
            setChapters(defaultChapters);
          }
        } else {
          // Xử lý bình thường cho các truyện khác
          const chaptersData = await MangaService.getChapters(mangaId);
          console.log('Raw chapters data:', chaptersData);

          if (chaptersData && Array.isArray(chaptersData)) {
            if (chaptersData.length > 0) {
              processChaptersData(chaptersData);
            } else {
              handleNoChapters();
            }
          } else {
            console.error('Invalid chapters data:', chaptersData);
            setError('Dữ liệu chapter không hợp lệ');
          }
        }

        // Hàm xử lý dữ liệu chapters
        function processChaptersData(chaptersData) {
          console.log(`Loaded ${chaptersData.length} chapters`);

          // Đảm bảo mỗi chapter có đủ thông tin cần thiết
          const processedChapters = chaptersData.map(chapter => ({
            ...chapter,
            id: chapter.id || chapter._id || `${mangaId}-chapter-${chapter.number}`,
            number: chapter.number || parseInt(chapter.id) || 0,
            title: chapter.title || `Chapter ${chapter.number}`,
            date: chapter.date || chapter.createdAt || new Date().toISOString(),
            mangaId: mangaId
          }));

          // Sắp xếp chapter theo số thứ tự (giảm dần - chapter mới nhất lên đầu)
          const sortedChapters = [...processedChapters].sort((a, b) => {
            const numA = a.number || parseInt(a.id) || 0;
            const numB = b.number || parseInt(b.id) || 0;
            return numB - numA;
          });

          console.log('Processed and sorted chapters:', sortedChapters);
          setChapters(sortedChapters);
        }

        // Hàm xử lý khi không tìm thấy chapter
        function handleNoChapters() {
          console.log('No chapters found for this manga');
          setChapters([]);
        }
      } catch (error) {
        console.error('Error loading manga details:', error);
        setError('Đã xảy ra lỗi khi tải thông tin truyện. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMangaDetails();
  }, [mangaId]);

  // Xử lý khi người dùng chọn một chapter
  const handleReadChapter = (chapterId) => {
    console.log(`Navigating to chapter: ${chapterId} for manga: ${mangaId}`);

    // Xử lý đặc biệt cho truyện Cưa Thủ
    if (mangaId === 'cưa_thủ') {
      navigate(`/cua-thu/chapter/${chapterId}`);
    } else {
      navigate(`/manga/${mangaId}/chapter/${chapterId}`);
    }
  };

  // Xử lý quay lại trang chủ
  const handleGoBack = () => {
    navigate('/');
  };

  // Xóa cache và tải lại trang
  const clearCacheAndReload = () => {
    console.log(`Clearing cache for manga: ${mangaId}`);
    MangaService.clearCache(mangaId);

    // Tải lại trang
    window.location.reload();
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Lỗi</h2>
          <p className="mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearCacheAndReload}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaSync className="mr-2" /> Xóa cache và thử lại
            </button>
            <button
              onClick={handleGoBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Không tìm thấy truyện</h2>
          <p className="mb-4">Truyện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearCacheAndReload}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaSync className="mr-2" /> Xóa cache và thử lại
            </button>
            <button
              onClick={handleGoBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header với nút quay lại */}
      <div className="bg-white shadow-md mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <button
            onClick={handleGoBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" /> Quay lại trang chủ
          </button>

          <button
            onClick={clearCacheAndReload}
            className="flex items-center text-green-600 hover:text-green-800"
            title="Xóa cache và tải lại trang"
          >
            <FaSync className="mr-2" /> Tải lại dữ liệu
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
          {/* Nội dung chính */}
          <div className="lg:col-span-6">
            {/* Thông tin truyện */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="md:w-1/3 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img
                      src={manga.thumbnail && manga.thumbnail.startsWith('/') ? manga.thumbnail : `/images/default-manga-cover.svg`}
                      alt={manga.title}
                      className="w-full h-auto object-cover rounded-lg shadow"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        console.log('Error loading thumbnail:', manga.thumbnail);
                        e.target.onerror = null;
                        e.target.src = '/images/default-manga-cover.svg';
                      }}
                    />
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{manga.title}</h1>

                    <div className="flex items-center mb-4">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span className="text-gray-700 mr-4">{manga.rating || 5.0}</span>
                      <FaEye className="text-blue-500 mr-1" />
                      <span className="text-gray-700">{manga.views?.toLocaleString() || 0}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <span className="text-gray-600">Tác giả: </span>
                        <span className="font-medium">{manga.author || 'Không rõ'}</span>
                      </div>

                      {manga.releaseYear && (
                        <div>
                          <span className="text-gray-600">Năm xuất bản: </span>
                          <span className="font-medium">{manga.releaseYear}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-600">Thể loại: </span>
                        <span className="font-medium">
                          {manga.genres && Array.isArray(manga.genres)
                            ? manga.genres.join(', ')
                            : manga.genre || 'Không rõ'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-600">Trạng thái: </span>
                        <span className={`font-medium ${
                          manga.status === 'Completed' || manga.status === 'Hoàn thành'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}>
                          {manga.status || 'Đang tiến hành'}
                        </span>
                      </div>
                    </div>

                    {/* Nút đọc từ đầu */}
                    {chapters.length > 0 && (
                      <button
                        onClick={() => handleReadChapter(chapters[0].id || chapters[0].number || 1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Đọc từ đầu
                      </button>
                    )}
                  </div>
                </div>

                {/* Giới thiệu */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Giới thiệu</h3>
                  <p className="text-gray-700">{manga.description || 'Không có mô tả.'}</p>
                </div>
              </div>
            </div>

            {/* Danh sách tập */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách tập</h2>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <div
                        key={chapter.id || chapter._id || chapter.number}
                        className="border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleReadChapter(chapter.id || chapter.number)}
                      >
                        <div className="p-3 text-center">
                          <h3 className="font-medium text-blue-600 hover:text-blue-800 mb-1">
                            Tập {chapter.number}
                          </h3>
                          <div className="text-xs text-gray-500">
                            {formatDate(chapter.date || chapter.createdAt || new Date().toISOString())}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-4 text-center text-gray-500">
                      Không có tập nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar phải - Khuyến mãi */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg overflow-hidden shadow-md">
              <div className="p-4 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <span className="mr-2">🔔</span> Khuyến mãi
                </h2>
              </div>

              <div className="bg-blue-400 bg-opacity-50 p-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                  <h3 className="text-white font-semibold">Giảm 10% nạp lần đầu</h3>
                  <p className="text-white text-sm mt-1">Áp dụng đến ngày 30/6/2023</p>
                  <button className="mt-2 bg-white text-blue-600 text-sm px-3 py-1 rounded-full hover:bg-blue-50">
                    Nhận ngay
                  </button>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                  <h3 className="text-white font-semibold">Giảm 20% nạp lần đầu</h3>
                  <p className="text-white text-sm mt-1">Áp dụng đến ngày 27/8/2023</p>
                  <button className="mt-2 bg-white text-blue-600 text-sm px-3 py-1 rounded-full hover:bg-blue-50">
                    Nhận ngay
                  </button>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <h3 className="text-white font-semibold">Giảm 30% nạp lần đầu</h3>
                  <p className="text-white text-sm mt-1">Áp dụng đến ngày 30/9/2023</p>
                  <button className="mt-2 bg-white text-blue-600 text-sm px-3 py-1 rounded-full hover:bg-blue-50">
                    Nhận ngay
                  </button>
                </div>

                <div className="text-center mt-4">
                  <button className="text-white hover:underline text-sm font-medium">
                    Xem thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Quảng cáo */}
            <div className="mt-6 bg-gray-200 rounded-lg overflow-hidden shadow-md">
              <img
                src="https://via.placeholder.com/300x250?text=Manga+mới+nhất"
                alt="Manga mới nhất"
                className="w-full h-auto"
              />
              <div className="p-3 text-center text-gray-700 text-sm">
                Manga mới nhất
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;
