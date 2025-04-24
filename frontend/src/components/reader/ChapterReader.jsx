import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaHome, FaList, FaArrowLeft, FaArrowRight, FaCog, FaBookmark, FaRegBookmark, FaFont, FaMoon, FaSun, FaComments } from 'react-icons/fa';
import MangaReader from './MangaReader';
import MangaService from '../../services/MangaService';

/**
 * ChapterReader - Trang đọc chương truyện
 */
const ChapterReader = () => {
  const { storyId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 18,
    lineHeight: 1.8,
    theme: 'light',
    fontFamily: 'serif'
  });

  const contentRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Kiểm tra xem có dữ liệu truyện local không
  const [useMangaReader, setUseMangaReader] = useState(false);

  useEffect(() => {
    const checkLocalData = async () => {
      try {
        // Kiểm tra xem có dữ liệu local không
        const localInfo = await fetch(`/data/manga/${storyId}/info.json`);
        const localChapters = await fetch(`/data/manga/${storyId}/chapters.json`);

        if (localInfo.ok && localChapters.ok) {
          // Nếu có dữ liệu local, sử dụng MangaReader
          setUseMangaReader(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Không tìm thấy dữ liệu local, sử dụng API');
      }

      // Nếu không có dữ liệu local, tiếp tục với API
      fetchAPIData();
    };

    const fetchAPIData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin truyện
        const storyResponse = await axios.get(`${API_URL}stories/${storyId}`);

        // Lấy danh sách chương
        const chaptersResponse = await axios.get(`${API_URL}stories/${storyId}/chapters`);

        // Lấy nội dung chương
        const chapterResponse = await axios.get(`${API_URL}stories/${storyId}/chapters/${chapterNumber}`);

        if (storyResponse.status === 200) {
          setStory(storyResponse.data);
        }

        if (chaptersResponse.status === 200) {
          setChapters(chaptersResponse.data);
        }

        if (chapterResponse.status === 200) {
          setChapter(chapterResponse.data);
          // Cập nhật tiêu đề trang
          document.title = `${chapterResponse.data.title} - ${storyResponse.data.title}`;
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chương truyện:', error);

        // Dữ liệu mẫu để test
        const sampleStory = generateSampleStory(storyId);
        const sampleChapters = generateSampleChapters(storyId, 50);
        const currentChapter = sampleChapters.find(c => c.number === parseInt(chapterNumber)) ||
                              generateSampleChapter(storyId, parseInt(chapterNumber));

        setStory(sampleStory);
        setChapters(sampleChapters);
        setChapter(currentChapter);

        // Cập nhật tiêu đề trang
        document.title = `${currentChapter.title} - ${sampleStory.title}`;

        toast.error('Không thể lấy dữ liệu chương truyện. Đang hiển thị dữ liệu mẫu.');
      } finally {
        setLoading(false);
        // Cuộn lên đầu trang
        window.scrollTo(0, 0);
      }
    };

    checkLocalData();

    // Lưu tiến trình đọc
    return () => {
      if (!useMangaReader) {
        saveReadingProgress();
      }
    };
  }, [storyId, chapterNumber]);

  // Lưu tiến trình đọc
  const saveReadingProgress = () => {
    if (story && chapter) {
      const readingProgress = JSON.parse(localStorage.getItem('readingProgress') || '{}');
      readingProgress[storyId] = {
        storyId,
        storyTitle: story.title,
        thumbnail: story.thumbnail,
        chapterNumber: parseInt(chapterNumber),
        chapterTitle: chapter.title,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('readingProgress', JSON.stringify(readingProgress));
    }
  };

  // Tạo dữ liệu mẫu để test
  const generateSampleStory = (storyId) => {
    return {
      _id: storyId,
      title: 'Truyện mẫu chi tiết',
      author: 'Tác giả mẫu',
      thumbnail: 'https://picsum.photos/id/237/400/600'
    };
  };

  // Tạo danh sách chương mẫu
  const generateSampleChapters = (storyId, chapterCount) => {
    return Array.from({ length: chapterCount }, (_, i) => {
      const chapterNumber = i + 1;
      return {
        _id: `${storyId}-chapter-${chapterNumber}`,
        number: chapterNumber,
        title: `Chương ${chapterNumber}: ${chapterNumber % 5 === 0 ? 'Chương đặc biệt' : 'Tiêu đề chương'}`,
        isLocked: chapterNumber % 7 === 0 // Khóa một số chương VIP
      };
    });
  };

  // Tạo chương mẫu
  const generateSampleChapter = (storyId, chapterNumber) => {
    return {
      _id: `${storyId}-chapter-${chapterNumber}`,
      number: chapterNumber,
      title: `Chương ${chapterNumber}: ${chapterNumber % 5 === 0 ? 'Chương đặc biệt' : 'Tiêu đề chương'}`,
      content: `
        <p>Đây là nội dung mẫu cho chương ${chapterNumber}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

        <p>Nhân vật chính của chúng ta đang đối mặt với thử thách lớn. Anh ta phải vượt qua nhiều khó khăn để đạt được mục tiêu của mình.</p>

        <p>"Ta không bao giờ từ bỏ!" - Anh ta hét lên, đôi mắt rực lửa quyết tâm.</p>

        <p>Đối thủ của anh ta cười nhạt: "Ngươi nghĩ mình có thể đánh bại ta sao?"</p>

        <p>Một trận chiến khốc liệt diễn ra. Ánh sáng và bóng tối va chạm, tạo nên những tia lửa rực rỡ trên bầu trời.</p>

        <p>Cuối cùng, sau nhiều nỗ lực, nhân vật chính của chúng ta đã chiến thắng. Anh ta đứng đó, thở hổn hển nhưng đầy tự hào.</p>

        <p>Đây chỉ là khởi đầu của một hành trình dài. Còn nhiều thử thách đang chờ đợi phía trước.</p>

        <p>Hãy đón đọc chương tiếp theo để biết điều gì sẽ xảy ra!</p>
      `,
      isLocked: chapterNumber % 7 === 0 // Khóa một số chương VIP
    };
  };

  // Chuyển đến chương trước
  const goToPreviousChapter = () => {
    const currentIndex = chapters.findIndex(c => c.number === parseInt(chapterNumber));
    if (currentIndex > 0) {
      navigate(`/story/${storyId}/chapter/${chapters[currentIndex - 1].number}`);
    } else {
      toast.info('Đây là chương đầu tiên');
    }
  };

  // Chuyển đến chương sau
  const goToNextChapter = () => {
    const currentIndex = chapters.findIndex(c => c.number === parseInt(chapterNumber));
    if (currentIndex < chapters.length - 1) {
      navigate(`/story/${storyId}/chapter/${chapters[currentIndex + 1].number}`);
    } else {
      toast.info('Đây là chương mới nhất');
    }
  };

  // Xử lý thay đổi cài đặt
  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });

    // Lưu cài đặt vào localStorage
    const savedSettings = JSON.parse(localStorage.getItem('readerSettings') || '{}');
    savedSettings[key] = value;
    localStorage.setItem('readerSettings', JSON.stringify(savedSettings));
  };

  // Xử lý đánh dấu chương
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Đã bỏ đánh dấu chương' : 'Đã đánh dấu chương');
  };

  // Xử lý phím tắt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousChapter();
      } else if (e.key === 'ArrowRight') {
        goToNextChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chapters, chapterNumber]);

  // Lấy cài đặt từ localStorage
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('readerSettings') || '{}');
    setSettings({
      ...settings,
      ...savedSettings
    });
  }, []);

  // Nếu sử dụng MangaReader
  if (useMangaReader) {
    return <MangaReader />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!story || !chapter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Không tìm thấy chương truyện</h2>
        <p className="mb-6">Chương truyện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Kiểm tra nếu chương bị khóa
  if (chapter.isLocked) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 text-center">
          <div className="text-yellow-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Chương VIP</h2>
          <p className="mb-6">Chương này yêu cầu mua VIP để đọc.</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
              Mua chương này
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Mua VIP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${settings.theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      {/* Top Navigation */}
      <div className={`sticky top-0 z-10 ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to={`/story/${storyId}`} className="mr-4 text-lg">
              <FaHome />
            </Link>
            <h1 className="font-medium truncate max-w-xs">{story.title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className={`text-lg ${showChapterList ? 'text-blue-500' : ''}`}
            >
              <FaList />
            </button>
            <button
              onClick={handleBookmark}
              className={`text-lg ${isBookmarked ? 'text-yellow-500' : ''}`}
            >
              {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`text-lg ${showSettings ? 'text-blue-500' : ''}`}
            >
              <FaCog />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} border-b ${settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Font Size */}
              <div>
                <label className="block text-sm mb-1">Cỡ chữ</label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleSettingChange('fontSize', Math.max(14, settings.fontSize - 2))}
                    className={`w-8 h-8 flex items-center justify-center rounded ${settings.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    -
                  </button>
                  <span className="mx-2 w-8 text-center">{settings.fontSize}</span>
                  <button
                    onClick={() => handleSettingChange('fontSize', Math.min(24, settings.fontSize + 2))}
                    className={`w-8 h-8 flex items-center justify-center rounded ${settings.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm mb-1">Giãn dòng</label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleSettingChange('lineHeight', Math.max(1.2, settings.lineHeight - 0.2))}
                    className={`w-8 h-8 flex items-center justify-center rounded ${settings.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    -
                  </button>
                  <span className="mx-2 w-8 text-center">{settings.lineHeight.toFixed(1)}</span>
                  <button
                    onClick={() => handleSettingChange('lineHeight', Math.min(2.4, settings.lineHeight + 0.2))}
                    className={`w-8 h-8 flex items-center justify-center rounded ${settings.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm mb-1">Phông chữ</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className={`px-2 py-1 rounded ${settings.theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm mb-1">Chế độ</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSettingChange('theme', 'light')}
                    className={`px-3 py-1 rounded flex items-center ${
                      settings.theme === 'light'
                        ? 'bg-blue-500 text-white'
                        : settings.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <FaSun className="mr-1" /> Sáng
                  </button>
                  <button
                    onClick={() => handleSettingChange('theme', 'dark')}
                    className={`px-3 py-1 rounded flex items-center ${
                      settings.theme === 'dark'
                        ? 'bg-blue-500 text-white'
                        : settings.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <FaMoon className="mr-1" /> Tối
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter List */}
      {showChapterList && (
        <div className={`${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} border-b ${settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Danh sách chương</h3>
              <select className={`text-sm px-2 py-1 rounded ${settings.theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}>
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>

            <div className={`max-h-60 overflow-y-auto ${settings.theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chapters.map((c) => (
                  <Link
                    key={c._id}
                    to={`/story/${storyId}/chapter/${c.number}`}
                    className={`px-3 py-2 rounded text-sm truncate ${
                      parseInt(chapterNumber) === c.number
                        ? settings.theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100 text-blue-800'
                        : settings.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    } ${c.isLocked ? 'text-gray-500' : ''}`}
                  >
                    {c.isLocked && '🔒 '}
                    {c.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{chapter.title}</h2>

        <div
          ref={contentRef}
          className="chapter-content"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily
          }}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        ></div>

        {/* Chapter Navigation */}
        <div className="mt-12 flex justify-between">
          <button
            onClick={goToPreviousChapter}
            className={`flex items-center px-4 py-2 rounded ${
              settings.theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={parseInt(chapterNumber) <= 1}
          >
            <FaArrowLeft className="mr-2" /> Chương trước
          </button>

          <button
            onClick={goToNextChapter}
            className={`flex items-center px-4 py-2 rounded ${
              settings.theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={parseInt(chapterNumber) >= chapters.length}
          >
            Chương sau <FaArrowRight className="ml-2" />
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <FaComments className="mr-2" /> Bình luận
            </h3>
            <Link
              to={`/story/${storyId}#comments`}
              className="text-blue-500 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className={`p-4 rounded-lg ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <textarea
              placeholder="Viết bình luận của bạn..."
              className={`w-full p-3 rounded-lg ${
                settings.theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-800 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-400`}
              rows="3"
            ></textarea>

            <div className="mt-2 flex justify-end">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md py-3 px-4`}>
        <div className="max-w-3xl mx-auto flex justify-between">
          <button
            onClick={goToPreviousChapter}
            className={`flex items-center px-4 py-2 rounded ${
              settings.theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={parseInt(chapterNumber) <= 1}
          >
            <FaArrowLeft className="mr-2" /> Chương trước
          </button>

          <Link
            to={`/story/${storyId}`}
            className={`flex items-center px-4 py-2 rounded ${
              settings.theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <FaList className="mr-2" /> Mục lục
          </Link>

          <button
            onClick={goToNextChapter}
            className={`flex items-center px-4 py-2 rounded ${
              settings.theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={parseInt(chapterNumber) >= chapters.length}
          >
            Chương sau <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>

      {/* Add padding to bottom to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default ChapterReader;
