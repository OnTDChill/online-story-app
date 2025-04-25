import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaList, FaArrowLeft, FaArrowRight, FaBookmark, FaComments, FaCog, FaTrash, FaSync } from 'react-icons/fa';
import MangaService from '../../services/MangaService';

/**
 * MangaReader - Component để đọc truyện
 */
const MangaReader = (props) => {
  const params = useParams();
  const mangaId = props.mangaId || params.mangaId;
  const chapterNumber = params.chapterNumber;
  const navigate = useNavigate();

  console.log('MangaReader props:', props);
  console.log('MangaReader params:', params);
  console.log('MangaReader mangaId:', mangaId);
  console.log('MangaReader chapterNumber:', chapterNumber);
  const [manga, setManga] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [readingMode, setReadingMode] = useState('vertical'); // vertical, horizontal
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  // Lấy dữ liệu truyện và chương
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Xử lý đặc biệt cho truyện Cưa Thủ
        if (mangaId === 'cưa_thủ') {
          console.log('Clearing cache for Cưa Thủ manga');
          // Xóa cache cho truyện Cưa Thủ
          MangaService.clearCache('cưa_thủ');
          MangaService.clearCache('cua_thu');
        }

        // Lấy thông tin truyện
        const mangaData = await MangaService.getManga(mangaId);
        if (mangaData) {
          setManga(mangaData);
        }

        // Lấy danh sách chương
        const chaptersData = await MangaService.getChapters(mangaId);
        if (chaptersData) {
          setChapters(chaptersData);
        }

        // Lấy nội dung chương hiện tại
        console.log(`Fetching chapter ${chapterNumber} for manga ${mangaId}`);
        let chapterData = await MangaService.getChapter(mangaId, chapterNumber);
        console.log('Chapter data:', chapterData);

        // Nếu không tìm thấy chapter, thử lại với cách khác
        if (!chapterData && mangaId === 'cưa_thủ') {
          console.log('Trying alternative method for Cưa Thủ');

          // Thử với URL không dấu
          chapterData = await MangaService.getChapter('cua_thu', chapterNumber);

          if (!chapterData) {
            // Thử tạo chapter data thủ công
            console.log('Creating manual chapter data for Cưa Thủ');

            // Tạo danh sách ảnh từ các thư mục con
            const possibleSubdirs = [
              'pages_001_100',
              'pages_101_200',
              'pages_201_300',
              'pages_301_400',
              'pages_401_500'
            ];

            let allImages = [];

            for (const subdir of possibleSubdirs) {
              for (let i = 1; i <= 100; i++) {
                const pageNum = i + (subdir === 'pages_101_200' ? 100 :
                                    subdir === 'pages_201_300' ? 200 :
                                    subdir === 'pages_301_400' ? 300 :
                                    subdir === 'pages_401_500' ? 400 : 0);

                allImages.push(`/data/manga/cưa_thủ/chapters/${chapterNumber}/${subdir}/${i.toString().padStart(3, '0')}.jpg`);
              }
            }

            chapterData = {
              _id: `cưa_thủ-chapter-${chapterNumber}`,
              id: chapterNumber,
              number: parseInt(chapterNumber),
              title: `Chương ${chapterNumber}`,
              mangaId: 'cưa_thủ',
              images: allImages,
              type: 'images',
              hasSubdirs: true,
              foundInSubdir: true,
              basePath: `/data/manga/cưa_thủ/chapters/${chapterNumber}`
            };
          }
        }

        if (chapterData) {
          setChapter(chapterData);
          // Lưu lịch sử đọc vào localStorage
          saveReadingHistory(mangaId, chapterNumber, mangaData?.title);
        } else {
          console.error(`Chapter ${chapterNumber} not found for manga ${mangaId}`);
        }
      } catch (error) {
        console.error('Error fetching manga data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Lấy cài đặt từ localStorage
    const savedReadingMode = localStorage.getItem('readingMode');
    if (savedReadingMode) {
      setReadingMode(savedReadingMode);
    }

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }

    // Thêm sự kiện phím tắt
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        navigateToPrevChapter();
      } else if (e.key === 'ArrowRight') {
        navigateToNextChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mangaId, chapterNumber]);

  // Lưu lịch sử đọc
  const saveReadingHistory = (mangaId, chapterNumber, title) => {
    try {
      const history = JSON.parse(localStorage.getItem('readingHistory')) || [];

      // Kiểm tra xem truyện đã có trong lịch sử chưa
      const existingIndex = history.findIndex(item => item.mangaId === mangaId);

      if (existingIndex !== -1) {
        // Cập nhật chương đang đọc
        history[existingIndex].chapterNumber = chapterNumber;
        history[existingIndex].timestamp = Date.now();
      } else {
        // Thêm mới vào lịch sử
        history.push({
          mangaId,
          title,
          chapterNumber,
          timestamp: Date.now()
        });
      }

      // Giới hạn lịch sử đọc (giữ 20 truyện gần nhất)
      const limitedHistory = history.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

      localStorage.setItem('readingHistory', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving reading history:', error);
    }
  };

  // Chuyển đến chương trước
  const navigateToPrevChapter = () => {
    if (!chapters.length) return;

    const currentIndex = chapters.findIndex(ch => ch.number === parseInt(chapterNumber));
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];

      // Xử lý đặc biệt cho truyện Cưa Thủ
      if (mangaId === 'cưa_thủ') {
        navigate(`/cua-thu/chapter/${prevChapter.number}`);
      } else {
        navigate(`/manga/${mangaId}/chapter/${prevChapter.number}`);
      }
    }
  };

  // Chuyển đến chương sau
  const navigateToNextChapter = () => {
    if (!chapters.length) return;

    const currentIndex = chapters.findIndex(ch => ch.number === parseInt(chapterNumber));
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];

      // Xử lý đặc biệt cho truyện Cưa Thủ
      if (mangaId === 'cưa_thủ') {
        navigate(`/cua-thu/chapter/${nextChapter.number}`);
      } else {
        navigate(`/manga/${mangaId}/chapter/${nextChapter.number}`);
      }
    }
  };

  // Thay đổi chế độ đọc
  const toggleReadingMode = () => {
    const newMode = readingMode === 'vertical' ? 'horizontal' : 'vertical';
    setReadingMode(newMode);
    localStorage.setItem('readingMode', newMode);
  };

  // Thay đổi chế độ tối/sáng
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Thay đổi cỡ chữ
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size.toString());
  };

  // Xóa cache và tải lại trang
  const clearCacheAndReload = () => {
    console.log(`Clearing cache for manga: ${mangaId}`);
    MangaService.clearCache(mangaId);

    // Tải lại trang
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!manga || !chapter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Không tìm thấy truyện hoặc chương</h2>
        <p className="mb-6">Truyện hoặc chương bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={clearCacheAndReload}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
          >
            <FaSync className="mr-2" /> Xóa cache và thử lại
          </button>
          <Link
            to={mangaId === 'cưa_thủ' ? '/cua-thu' : `/manga/${mangaId}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Quay lại trang truyện
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl">
                <FaHome />
              </Link>
              <Link to={`/story/${mangaId}`} className="font-medium truncate max-w-xs">
                {manga.title}
              </Link>
              <span className="text-sm text-gray-500">
                Chương {chapter.number}: {chapter.title}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={clearCacheAndReload}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Xóa cache và tải lại"
              >
                <FaSync />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FaCog />
              </button>
              <Link
                to={mangaId === 'cưa_thủ' ? '/cua-thu' : `/manga/${mangaId}`}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FaList />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`fixed top-16 right-4 z-20 p-4 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="font-semibold mb-3">Cài đặt đọc</h3>

          <div className="mb-3">
            <p className="mb-2">Chế độ đọc:</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setReadingMode('vertical')}
                className={`px-3 py-1 rounded ${
                  readingMode === 'vertical'
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                Dọc
              </button>
              <button
                onClick={() => setReadingMode('horizontal')}
                className={`px-3 py-1 rounded ${
                  readingMode === 'horizontal'
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                Ngang
              </button>
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2">Chế độ màu:</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setDarkMode(false)}
                className={`px-3 py-1 rounded ${
                  !darkMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Sáng
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`px-3 py-1 rounded ${
                  darkMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                Tối
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2">Cỡ chữ:</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changeFontSize(Math.max(14, fontSize - 2))}
                className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                A-
              </button>
              <span className="w-8 text-center">{fontSize}</span>
              <button
                onClick={() => changeFontSize(Math.min(24, fontSize + 2))}
                className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Navigation */}
      <div className={`sticky top-16 z-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} py-2`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={navigateToPrevChapter}
            disabled={chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) <= 0}
            className={`flex items-center px-3 py-1 rounded ${
              chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) <= 0
                ? 'opacity-50 cursor-not-allowed'
                : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <FaArrowLeft className="mr-1" /> Chương trước
          </button>

          <select
            value={chapterNumber}
            onChange={(e) => {
              // Xử lý đặc biệt cho truyện Cưa Thủ
              if (mangaId === 'cưa_thủ') {
                navigate(`/cua-thu/chapter/${e.target.value}`);
              } else {
                navigate(`/manga/${mangaId}/chapter/${e.target.value}`);
              }
            }}
            className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
          >
            {chapters.map((ch) => (
              <option key={ch.number} value={ch.number}>
                Chương {ch.number}: {ch.title}
              </option>
            ))}
          </select>

          <button
            onClick={navigateToNextChapter}
            disabled={chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) >= chapters.length - 1}
            className={`flex items-center px-3 py-1 rounded ${
              chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) >= chapters.length - 1
                ? 'opacity-50 cursor-not-allowed'
                : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            Chương sau <FaArrowRight className="ml-1" />
          </button>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="container mx-auto px-4 py-6">
        <div className={`${readingMode === 'vertical' ? 'space-y-4' : 'flex overflow-x-auto space-x-4 pb-4'}`}>
          {chapter.images && chapter.images.map((image, index) => (
            <div
              key={index}
              className={`${readingMode === 'horizontal' ? 'flex-shrink-0' : ''}`}
            >
              <img
                src={image}
                alt={`Page ${index + 1}`}
                className="mx-auto max-w-full"
                loading={index < 3 ? "eager" : "lazy"} // Tải ngay 3 trang đầu tiên
                decoding="async" // Giải mã hình ảnh không đồng bộ
                onError={(e) => {
                  console.error(`Error loading image: ${image}`);

                  // Xử lý đặc biệt cho truyện Cưa Thủ
                  if (mangaId === 'cưa_thủ') {
                    // Xác định số trang
                    let pageNumber = 1;
                    const match = image.match(/\/(\d+)\.jpg$/);
                    if (match) {
                      pageNumber = parseInt(match[1]);
                    }

                    // Xác định thư mục con dựa trên số trang
                    let subdir = 'pages_001_100';
                    if (pageNumber > 100 && pageNumber <= 200) subdir = 'pages_101_200';
                    else if (pageNumber > 200 && pageNumber <= 300) subdir = 'pages_201_300';
                    else if (pageNumber > 300 && pageNumber <= 400) subdir = 'pages_301_400';
                    else if (pageNumber > 400 && pageNumber <= 500) subdir = 'pages_401_500';
                    else if (pageNumber > 500 && pageNumber <= 600) subdir = 'pages_501_600';
                    else if (pageNumber > 600 && pageNumber <= 700) subdir = 'pages_601_700';
                    else if (pageNumber > 700 && pageNumber <= 800) subdir = 'pages_701_800';
                    else if (pageNumber > 800 && pageNumber <= 900) subdir = 'pages_801_900';
                    else if (pageNumber > 900 && pageNumber <= 1000) subdir = 'pages_901_1000';
                    else if (pageNumber > 1000) subdir = 'pages_1001_plus';

                    // Tạo đường dẫn mới
                    const fileName = pageNumber.toString().padStart(3, '0') + '.jpg';

                    // Thử các đường dẫn khác nhau
                    const paths = [
                      `/data/manga/cưa_thủ/chapters/${chapterNumber}/${subdir}/${fileName}`,
                      `/data/manga/cua_thu/chapters/${chapterNumber}/${subdir}/${fileName}`,
                      `/data/manga/cưa_thủ/chapters/${chapterNumber}/${fileName}`,
                      `/data/manga/cua_thu/chapters/${chapterNumber}/${fileName}`
                    ];

                    // Sử dụng đường dẫn đầu tiên
                    console.log(`Trying alternative paths for page ${pageNumber}`);
                    e.target.onerror = (e2) => {
                      // Nếu đường dẫn đầu tiên không hoạt động, thử đường dẫn thứ hai
                      if (paths.length > 1) {
                        const nextPath = paths.shift();
                        console.log(`Trying next path: ${nextPath}`);
                        e.target.src = nextPath;
                      } else {
                        // Nếu không có đường dẫn nào hoạt động, hiển thị ảnh mặc định
                        e.target.onerror = null;
                        e.target.src = '/images/default-manga-cover.svg';
                      }
                    };

                    e.target.src = paths[0];
                  }
                  // Thử tải lại với đường dẫn khác nếu là 001.jpg
                  else if (image.includes('/001.jpg')) {
                    console.log('Trying alternative image path for first page');
                    e.target.src = image.replace('/001.jpg', '/002.jpg');
                  } else if (image.includes('/1.jpg')) {
                    e.target.src = image.replace('/1.jpg', '/2.jpg');
                  } else {
                    e.target.onerror = null;
                    e.target.src = '/images/default-manga-cover.svg';
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={`sticky bottom-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md py-3`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={navigateToPrevChapter}
            disabled={chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) <= 0}
            className={`flex items-center px-4 py-2 rounded ${
              chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) <= 0
                ? 'opacity-50 cursor-not-allowed'
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <FaArrowLeft className="mr-2" /> Chương trước
          </button>

          <div className="flex space-x-4">
            <button
              onClick={toggleReadingMode}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title={readingMode === 'vertical' ? 'Chuyển sang chế độ đọc ngang' : 'Chuyển sang chế độ đọc dọc'}
            >
              {readingMode === 'vertical' ? '↕️' : '↔️'}
            </button>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <button
            onClick={navigateToNextChapter}
            disabled={chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) >= chapters.length - 1}
            className={`flex items-center px-4 py-2 rounded ${
              chapters.findIndex(ch => ch.number === parseInt(chapterNumber)) >= chapters.length - 1
                ? 'opacity-50 cursor-not-allowed'
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            Chương sau <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MangaReader;
