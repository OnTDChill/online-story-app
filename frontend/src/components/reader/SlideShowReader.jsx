import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaArrowRight, FaExpand, FaCompress, FaPlay, FaPause } from 'react-icons/fa';

/**
 * SlideShowReader - Component hiển thị truyện dạng hình ảnh với chế độ trình chiếu
 * @param {Array} images - Mảng các đường dẫn hình ảnh
 * @param {Function} onClose - Hàm xử lý khi đóng trình chiếu
 * @param {String} title - Tiêu đề của truyện/chapter
 */
const SlideShowReader = ({ images, onClose, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideInterval, setSlideInterval] = useState(null);
  const [slideSpeed, setSlideSpeed] = useState(3000); // 3 giây mỗi slide

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

  // Xử lý chế độ tự động chuyển slide
  useEffect(() => {
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
    };
  }, [isPlaying, slideSpeed, handleNext, slideInterval]);

  // Xử lý thay đổi tốc độ trình chiếu
  const handleSpeedChange = (e) => {
    setSlideSpeed(parseInt(e.target.value));
  };

  // Xử lý play/pause
  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Quay lại
        </button>
        <h2 className="text-lg font-semibold">{title} - Trang {currentIndex + 1}/{images.length}</h2>
        <button
          onClick={toggleFullscreen}
          className="text-white hover:text-gray-300"
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Nút điều hướng trái */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 hover:bg-opacity-70 z-10"
        >
          <FaArrowLeft size={24} />
        </button>

        {/* Hình ảnh */}
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
            onClick={handleNext}
          />
        </div>

        {/* Nút điều hướng phải */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 hover:bg-opacity-70 z-10"
        >
          <FaArrowRight size={24} />
        </button>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-4">
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
            <span>{currentIndex + 1} / {images.length}</span>
            <input
              type="range"
              min="0"
              max={images.length - 1}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
              className="w-48"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideShowReader;
