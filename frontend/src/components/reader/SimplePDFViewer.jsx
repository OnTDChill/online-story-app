import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaHome, FaDownload, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SimplePDFViewer - Component đơn giản để hiển thị file PDF bằng thẻ iframe
 */
const SimplePDFViewer = ({ pdfUrl, title, onClose, chapters, currentChapter }) => {
  const navigate = useNavigate();
  const [showChapterList, setShowChapterList] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

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
        navigate(`/manga/${prevChapter.mangaId || window.location.pathname.split('/')[2]}/chapter/${prevChapter.number}`);
      }
    }
  };

  // Chuyển đến chương tiếp theo
  const goToNextChapter = () => {
    if (chapters && currentChapter) {
      const currentIndex = chapters.findIndex(ch => ch._id === currentChapter._id);
      if (currentIndex < chapters.length - 1) {
        const nextChapter = chapters[currentIndex + 1];
        navigate(`/manga/${nextChapter.mangaId || window.location.pathname.split('/')[2]}/chapter/${nextChapter.number}`);
      }
    }
  };

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

  // Xử lý sự kiện phím
  useEffect(() => {
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
  }, [chapters, currentChapter, controlsTimeout]);

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            className="fixed top-0 left-0 right-0 z-20 bg-gray-800 shadow-md"
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
                    className="text-xl text-gray-300 hover:text-white"
                  >
                    <FaArrowLeft />
                  </button>
                  <h1 className="text-base font-medium truncate">{title}</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleGoHome}
                    className="text-xl text-gray-300 hover:text-white"
                    title="Trang chủ"
                  >
                    <FaHome />
                  </button>
                  <button
                    onClick={toggleChapterList}
                    className="text-xl text-gray-300 hover:text-white"
                    title="Danh sách chương"
                  >
                    <FaList />
                  </button>
                  <a
                    href={pdfUrl}
                    download
                    className="text-xl text-gray-300 hover:text-white"
                    title="Tải xuống"
                  >
                    <FaDownload />
                  </a>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 w-full pt-16 pb-16">
        <div className="h-full w-full">
          <iframe
            src={pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0'}
            title={title}
            className="w-full h-full"
            style={{ height: 'calc(100vh - 120px)' }}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </div>

      {/* Chapter List Overlay */}
      <AnimatePresence>
        {showChapterList && (
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-80 bg-gray-800 shadow-md overflow-y-auto z-30 border-l border-gray-700"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-200 text-base font-medium">Danh sách tập</h3>
                <button
                  onClick={toggleChapterList}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <FaArrowLeft className="text-base" />
                </button>
              </div>
              <div className="space-y-2">
                {chapters && chapters.map((chapter) => (
                  <a
                    key={chapter._id}
                    href={`/manga/${chapter.mangaId || window.location.pathname.split('/')[2]}/chapter/${chapter.number}`}
                    className={`block p-3 text-sm rounded-md ${currentChapter && currentChapter._id === chapter._id ? 'bg-blue-700 text-white' : 'hover:bg-gray-700'}`}
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
            className="fixed bottom-0 left-0 right-0 z-20 bg-gray-800 shadow-md"
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
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md flex items-center text-sm font-medium"
                    title="Chương trước"
                  >
                    <FaChevronLeft className="mr-2" /> Trước
                  </button>
                  <button
                    onClick={toggleChapterList}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md flex items-center text-sm font-medium"
                  >
                    <FaList className="mr-2" /> Danh sách
                  </button>
                  <button
                    onClick={goToNextChapter}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md flex items-center text-sm font-medium"
                    title="Chương sau"
                  >
                    Sau <FaChevronRight className="ml-2" />
                  </button>
                </div>

                {/* Chapter Info */}
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

export default SimplePDFViewer;
