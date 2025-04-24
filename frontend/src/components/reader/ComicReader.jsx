import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaArrowRight, FaCog, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

/**
 * ComicReader - Component để đọc truyện theo kiểu cuộn dọc
 */
const ComicReader = ({ pdfUrl, title, onClose, chapters, currentChapter }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Tải hình ảnh từ thư mục manga
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        console.log('Loading images for chapter:', currentChapter);

        if (currentChapter && currentChapter.images && currentChapter.images.length > 0) {
          // Nếu chương đã có danh sách hình ảnh
          console.log('Using images from chapter data:', currentChapter.images);
          const formattedImages = currentChapter.images.map((imgPath, index) => ({
            url: imgPath,
            pageNumber: index + 1
          }));
          setImages(formattedImages);
        } else if (currentChapter) {
          // Nếu không có danh sách hình ảnh, thử tải từ thư mục
          const mangaId = 'doraemon';
          const chapterNumber = currentChapter.number;
          console.log('No images in chapter data, generating paths for chapter:', chapterNumber);

          // Tạo đường dẫn đến thư mục chứa hình ảnh của chương
          const chapterImagesPath = `/data/manga/${mangaId}/chapters/${chapterNumber}`;

          // Trong trường hợp thực tế, bạn sẽ cần một API để lấy danh sách hình ảnh
          // Ở đây chúng ta sẽ giả lập bằng cách tạo một mảng hình ảnh
          const numImages = 10; // Giả sử có 10 hình ảnh
          const formattedImages = Array.from({ length: numImages }, (_, index) => ({
            url: `${chapterImagesPath}/${(index + 1).toString().padStart(3, '0')}.jpg`,
            pageNumber: index + 1
          }));

          console.log('Generated image paths:', formattedImages.map(img => img.url));
          setImages(formattedImages);
        } else {
          // Nếu không có thông tin chương, sử dụng hình ảnh mẫu
          console.log('No chapter data, using sample images');
          const sampleImages = Array.from({ length: 10 }, (_, index) => ({
            url: `https://picsum.photos/800/1200?random=${index + 1}`,
            pageNumber: index + 1
          }));

          setImages(sampleImages);
        }
      } catch (error) {
        console.error('Lỗi khi tải hình ảnh:', error);
        toast.error('Không thể tải hình ảnh từ truyện');
      } finally {
        setLoading(false);
      }
    };

    loadImages();

    // Xử lý sự kiện phím
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          goToPrevChapter();
          break;
        case 'ArrowRight':
          goToNextChapter();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [currentChapter, chapters, controlsTimeout]);

  // Ẩn/hiện thanh điều khiển khi di chuột
  const handleMouseMove = () => {
    setShowControls(true);

    // Xóa timeout cũ nếu có
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    // Tạo timeout mới để ẩn thanh điều khiển sau 3 giây
    const timeout = setTimeout(() => {
      if (!showChapterList) { // Chỉ ẩn khi không hiển thị danh sách chương
        setShowControls(false);
      }
    }, 3000);

    setControlsTimeout(timeout);
  };

  // Quay về trang chủ
  const handleGoHome = () => {
    navigate('/');
  };

  // Quay về trang chi tiết truyện
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // Hiển thị/ẩn danh sách chương
  const toggleChapterList = () => {
    setShowChapterList(!showChapterList);
  };

  // Chuyển đến chương trước
  const goToPrevChapter = () => {
    if (chapters && currentChapter) {
      const currentIndex = chapters.findIndex(ch => ch._id === currentChapter._id);
      if (currentIndex > 0) {
        const prevChapter = chapters[currentIndex - 1];
        window.location.href = `/doraemon/chapter/${prevChapter.number}`;
      }
    }
  };

  // Chuyển đến chương tiếp theo
  const goToNextChapter = () => {
    if (chapters && currentChapter) {
      const currentIndex = chapters.findIndex(ch => ch._id === currentChapter._id);
      if (currentIndex < chapters.length - 1) {
        const nextChapter = chapters[currentIndex + 1];
        window.location.href = `/doraemon/chapter/${nextChapter.number}`;
      }
    }
  };

  // Thay đổi chế độ tối/sáng
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'} relative overflow-hidden`}
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            className={`fixed top-0 left-0 right-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBack}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`}
                  >
                    <FaArrowLeft />
                  </button>
                  <h1 className="text-base font-medium truncate">{title}</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleGoHome}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`}
                    title="Trang chủ"
                  >
                    <FaHome />
                  </button>
                  <button
                    onClick={toggleChapterList}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`}
                    title="Danh sách chương"
                  >
                    <FaList />
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`}
                    title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 w-full pt-16 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-4">
              {images.map((image, index) => (
                <div key={index} className="flex justify-center">
                  <img
                    src={image.url}
                    alt={`Trang ${image.pageNumber}`}
                    className="max-w-full rounded shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x1200?text=Không+tải+được+hình';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chapter List Overlay */}
      <AnimatePresence>
        {showChapterList && (
          <motion.div
            className={`fixed top-0 right-0 bottom-0 w-80 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} shadow-md overflow-y-auto z-30 border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-base font-medium`}>Danh sách tập</h3>
                <button
                  onClick={toggleChapterList}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <FaArrowLeft className="text-base" />
                </button>
              </div>
              <div className="space-y-2">
                {chapters && chapters.map((chapter) => (
                  <a
                    key={chapter._id}
                    href={`/doraemon/chapter/${chapter.number}`}
                    className={`block p-3 text-sm rounded-md ${
                      currentChapter && currentChapter._id === chapter._id
                        ? darkMode ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800 font-medium'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    {chapter.title}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                {/* Navigation Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPrevChapter}
                    className={`px-3 py-2 ${darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
                      rounded-md flex items-center text-sm font-medium`}
                    title="Chương trước"
                  >
                    <FaChevronLeft className="mr-2" /> Trước
                  </button>
                  <button
                    onClick={toggleChapterList}
                    className={`px-3 py-2 ${darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
                      rounded-md flex items-center text-sm font-medium`}
                  >
                    <FaList className="mr-2" /> Danh sách
                  </button>
                  <button
                    onClick={goToNextChapter}
                    className={`px-3 py-2 ${darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
                      rounded-md flex items-center text-sm font-medium`}
                    title="Chương sau"
                  >
                    Sau <FaChevronRight className="ml-2" />
                  </button>
                </div>

                {/* Page Info */}
                <div className="text-sm">
                  {currentChapter && (
                    <span>Chương {currentChapter.number}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComicReader;
