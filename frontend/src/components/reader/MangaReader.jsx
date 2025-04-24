import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaList, FaArrowLeft, FaArrowRight, FaBookmark, FaComments, FaCog } from 'react-icons/fa';
import MangaService from '../../services/MangaService';

/**
 * MangaReader - Component để đọc truyện
 */
const MangaReader = () => {
  const { mangaId, chapterNumber } = useParams();
  const navigate = useNavigate();
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
        const chapterData = await MangaService.getChapter(mangaId, chapterNumber);
        if (chapterData) {
          setChapter(chapterData);
          // Lưu lịch sử đọc vào localStorage
          saveReadingHistory(mangaId, chapterNumber, mangaData?.title);
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
      navigate(`/story/${mangaId}/chapter/${prevChapter.number}`);
    }
  };

  // Chuyển đến chương sau
  const navigateToNextChapter = () => {
    if (!chapters.length) return;
    
    const currentIndex = chapters.findIndex(ch => ch.number === parseInt(chapterNumber));
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      navigate(`/story/${mangaId}/chapter/${nextChapter.number}`);
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
        <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Quay lại trang chủ
        </Link>
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
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FaCog />
              </button>
              <Link 
                to={`/story/${mangaId}`}
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
            onChange={(e) => navigate(`/story/${mangaId}/chapter/${e.target.value}`)}
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x1200?text=Image+Not+Found';
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
