import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaHome, FaList, FaChevronUp, FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MangaSlideshow - Component hiển thị truyện tranh dạng hình ảnh với chế độ trình chiếu
 * @param {Array} images - Mảng các đường dẫn hình ảnh
 * @param {String} title - Tiêu đề của truyện/chapter
 * @param {Function} onClose - Hàm xử lý khi đóng trình chiếu
 * @param {Array} chapters - Danh sách các chapter
 * @param {Object} currentChapter - Thông tin chapter hiện tại
 * @param {String} mangaId - ID của manga
 */
const MangaSlideshow = ({
  images,
  title,
  onClose,
  chapters = [],
  currentChapter,
  mangaId
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideInterval, setSlideInterval] = useState(null);
  const [slideSpeed, setSlideSpeed] = useState(3000); // 3 giây mỗi slide
  const [showChapterList, setShowChapterList] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  // Xử lý hiển thị/ẩn thanh điều khiển
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);

      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }

      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      setControlsTimeout(timeout);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Xử lý chuyển đến hình ảnh trước
  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  // Xử lý chuyển đến hình ảnh tiếp theo
  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  // Xử lý phím bấm
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === ' ') {
        // Phím space để play/pause
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrevious, onClose, isFullscreen]);

  // Xử lý chế độ toàn màn hình
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Xử lý sự kiện thay đổi trạng thái toàn màn hình
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Preload tất cả hình ảnh khi component được tải
  useEffect(() => {
    // Tạo một mảng để lưu trữ các hình ảnh đã preload
    const preloadedImages = [];

    // Preload tất cả hình ảnh nhưng ưu tiên các hình ảnh gần với trang hiện tại
    const preloadAllImages = () => {
      // Tạo một mảng các chỉ số ưu tiên: trang hiện tại, kế tiếp, trước đó, v.v.
      const priorityIndices = [];

      // Thêm trang hiện tại và 5 trang tiếp theo vào đầu danh sách ưu tiên
      for (let i = 0; i <= 5; i++) {
        const nextIndex = (currentIndex + i) % images.length;
        if (!priorityIndices.includes(nextIndex)) {
          priorityIndices.push(nextIndex);
        }
      }

      // Thêm 2 trang trước trang hiện tại
      for (let i = 1; i <= 2; i++) {
        const prevIndex = (currentIndex - i + images.length) % images.length;
        if (!priorityIndices.includes(prevIndex)) {
          priorityIndices.push(prevIndex);
        }
      }

      // Thêm các trang còn lại
      for (let i = 0; i < images.length; i++) {
        if (!priorityIndices.includes(i)) {
          priorityIndices.push(i);
        }
      }

      // Preload theo thứ tự ưu tiên
      priorityIndices.forEach((index) => {
        if (!preloadedImages[index]) {
          const img = new Image();
          img.src = images[index];
          preloadedImages[index] = img;
        }
      });
    };

    // Gọi preload ngay lập tức cho các trang ưu tiên
    preloadAllImages();

    // Thiết lập interval cho chế độ tự động
    if (isPlaying) {
      const interval = setInterval(() => {
        handleNext();
      }, slideSpeed);
      setSlideInterval(interval);
    } else {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    }

    return () => {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
      // Xóa các tham chiếu đến hình ảnh đã preload để tránh rò rỉ bộ nhớ
      preloadedImages.length = 0;
    };
  }, [isPlaying, slideSpeed, handleNext, slideInterval, currentIndex, images]);

  // Xử lý thay đổi tốc độ trình chiếu
  const handleSpeedChange = (e) => {
    setSlideSpeed(parseInt(e.target.value));
  };

  // Xử lý play/pause
  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Xử lý chuyển đến chapter trước
  const goToPreviousChapter = () => {
    if (!chapters || chapters.length === 0 || !currentChapter) return;

    const currentIndex = chapters.findIndex(ch =>
      ch._id === currentChapter._id ||
      ch.number === currentChapter.number
    );

    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      navigate(`/manga/${mangaId}/chapter/${prevChapter.number}`);
    }
  };

  // Xử lý chuyển đến chapter tiếp theo
  const goToNextChapter = () => {
    if (!chapters || chapters.length === 0 || !currentChapter) return;

    const currentIndex = chapters.findIndex(ch =>
      ch._id === currentChapter._id ||
      ch.number === currentChapter.number
    );

    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      navigate(`/manga/${mangaId}/chapter/${nextChapter.number}`);
    }
  };

  // Xử lý chọn chapter từ danh sách
  const handleSelectChapter = (chapter) => {
    navigate(`/manga/${mangaId}/chapter/${chapter.number}`);
    setShowChapterList(false);
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
      navigate(`/manga/${mangaId}`);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 text-white p-4 flex justify-between items-center z-10"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-white hover:text-gray-300 flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Quay lại
              </button>
              <h2 className="text-lg font-semibold">{title} - Trang {currentIndex + 1}/{images.length}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChapterList(!showChapterList)}
                className="text-white hover:text-gray-300"
                title="Danh sách chương"
              >
                <FaList />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300"
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter List Sidebar */}
      <AnimatePresence>
        {showChapterList && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 w-80 z-20 overflow-y-auto bg-gray-800"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Danh sách chương</h2>
                <button
                  onClick={() => setShowChapterList(false)}
                  className="text-white hover:text-gray-300"
                >
                  <FaArrowLeft />
                </button>
              </div>

              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div
                    key={chapter._id || chapter.number}
                    onClick={() => handleSelectChapter(chapter)}
                    className={`p-3 rounded cursor-pointer ${
                      (currentChapter?._id === chapter._id || currentChapter?.number === chapter.number)
                        ? 'bg-blue-900'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-white">{chapter.title || `Chương ${chapter.number}`}</div>
                    {chapter.createdAt && (
                      <div className="text-sm text-gray-400">
                        {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Nút điều hướng trái */}
        <AnimatePresence>
          {showControls && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 hover:bg-opacity-70 z-10 rounded-r"
            >
              <FaArrowLeft size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Hình ảnh với cơ chế tải tối ưu */}
        <div className="w-full h-full flex items-center justify-center">
          {/* Sử dụng cơ chế hiển thị hình ảnh tối ưu */}
          <div
            className="w-full h-full flex items-center justify-center relative"
            onClick={() => setShowControls(!showControls)}
          >
            {/* Placeholder khi hình ảnh đang tải */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
              style={{
                display: 'flex',
                opacity: 0.7,
                zIndex: 1
              }}
            >
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                <div>Đang tải trang {currentIndex + 1}...</div>
              </div>
            </div>

            {/* Hiển thị hình ảnh hiện tại */}
            <img
              key={`slide-${currentIndex}`}
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain relative z-10"
              loading="eager" // Tải ngay trang hiện tại
              decoding="async" // Giải mã hình ảnh không đồng bộ
              fetchpriority="high" // Ưu tiên cao nhất cho trang hiện tại
              style={{
                transition: 'opacity 0.2s ease-in-out',
                opacity: 1
              }}
              onLoad={(e) => {
                // Ẩn placeholder khi hình ảnh tải xong
                const parent = e.target.parentNode;
                if (parent) {
                  const placeholder = parent.querySelector('div.absolute');
                  if (placeholder) {
                    placeholder.style.display = 'none';
                  }
                }
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-manga-cover.svg';
              }}
            />
          </div>

          {/* Preload hình ảnh kế tiếp */}
          <div className="hidden">
            {/* Preload 5 hình ảnh tiếp theo */}
            {[1, 2, 3, 4, 5].map(offset => {
              const nextIndex = (currentIndex + offset) % images.length;
              if (nextIndex !== currentIndex) {
                return (
                  <link
                    key={`preload-${nextIndex}`}
                    rel="preload"
                    href={images[nextIndex]}
                    as="image"
                    fetchpriority={offset <= 2 ? "high" : "low"}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Nút điều hướng phải */}
        <AnimatePresence>
          {showControls && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 hover:bg-opacity-70 z-10 rounded-l"
            >
              <FaArrowRight size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 text-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                  {isPlaying ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                  {isPlaying ? 'Tạm dừng' : 'Tự động'}
                </button>

                {isPlaying && (
                  <div className="flex items-center space-x-2">
                    <span>Tốc độ:</span>
                    <select
                      value={slideSpeed}
                      onChange={handleSpeedChange}
                      className="bg-gray-700 text-white rounded px-2 py-1"
                    >
                      <option value="1000">Nhanh (1s)</option>
                      <option value="3000">Vừa (3s)</option>
                      <option value="5000">Chậm (5s)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPreviousChapter}
                  className={`px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white ${
                    !chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) <= 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }`}
                  disabled={!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) <= 0}
                >
                  Chương trước
                </button>

                <span>{currentIndex + 1} / {images.length}</span>
                <input
                  type="range"
                  min="0"
                  max={images.length - 1}
                  value={currentIndex}
                  onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                  className="w-48"
                />

                <button
                  onClick={goToNextChapter}
                  className={`px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white ${
                    !chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) >= chapters.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }`}
                  disabled={!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) >= chapters.length - 1}
                >
                  Chương tiếp
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MangaSlideshow;
