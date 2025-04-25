import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaHome, FaList, FaChevronUp, FaPlay, FaImages } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import MangaSlideshow from './MangaSlideshow';

/**
 * ImageBasedMangaViewer - Component để hiển thị truyện tranh dạng hình ảnh
 * Hỗ trợ cuộn dọc để xem từng trang và điều hướng giữa các chương
 * Tối ưu hiệu suất với tính năng phân trang và cuộn ảo
 */
const ImageBasedMangaViewer = ({
  images,
  title,
  onClose,
  chapters = [],
  currentChapter,
  mangaId
}) => {
  const navigate = useNavigate();
  const [showChapterList, setShowChapterList] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [loading, setLoading] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);

  // Tối ưu hiệu suất với phân trang
  const [visibleImages, setVisibleImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imagesPerPage, setImagesPerPage] = useState(10); // Số lượng ảnh mỗi trang
  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);

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

  // Xử lý chuyển đến chương trước
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

  // Xử lý chuyển đến chương tiếp theo
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

  // Xử lý chọn chương từ danh sách
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
      navigate(-1);
    }
  };

  // Hiển thị/ẩn danh sách chương
  const toggleChapterList = () => {
    setShowChapterList(!showChapterList);
  };

  // Chuyển đổi chế độ tối/sáng
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  // Cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý phân trang và tải thêm ảnh khi cuộn
  useEffect(() => {
    if (!images || images.length === 0) return;

    // Tính toán tổng số trang
    const total = Math.ceil(images.length / imagesPerPage);
    setTotalPages(total);

    // Tải trang đầu tiên
    loadImagesForPage(1);

    // Thiết lập Intersection Observer để tải thêm ảnh khi cuộn
    setupIntersectionObserver();

    return () => {
      // Dọn dẹp observer khi component unmount
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [images]);

  // Tải ảnh cho trang cụ thể
  const loadImagesForPage = (page) => {
    if (page > totalPages) {
      setHasMore(false);
      return;
    }

    setLoading(true);
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, images.length);

    // Lấy ảnh cho trang hiện tại
    const newImages = images.slice(startIndex, endIndex);

    // Thêm vào danh sách ảnh đã hiển thị
    setVisibleImages(prev => {
      // Tránh trùng lặp ảnh
      const existingUrls = new Set(prev.map(img => typeof img === 'string' ? img : img.url));
      const uniqueNewImages = newImages.filter(img =>
        !existingUrls.has(typeof img === 'string' ? img : img.url)
      );

      return [...prev, ...uniqueNewImages];
    });

    setCurrentPage(page);
    setLoading(false);
  };

  // Thiết lập Intersection Observer để tải thêm ảnh khi cuộn
  const setupIntersectionObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        // Tải trang tiếp theo khi cuộn đến cuối
        loadImagesForPage(currentPage + 1);
      }
    }, { threshold: 0.1 });

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }
  };

  // Tải trước ảnh tiếp theo
  const preloadNextImages = useCallback(() => {
    if (currentPage < totalPages) {
      const startIndex = currentPage * imagesPerPage;
      const endIndex = Math.min(startIndex + 5, images.length); // Chỉ tải trước 5 ảnh

      for (let i = startIndex; i < endIndex; i++) {
        const img = new Image();
        img.src = typeof images[i] === 'string' ? images[i] : images[i].url;
      }
    }
  }, [currentPage, imagesPerPage, images, totalPages]);

  // Tải trước ảnh khi trang hiện tại thay đổi
  useEffect(() => {
    preloadNextImages();
  }, [currentPage, preloadNextImages]);

  return (
    <>
      {showSlideshow && (
        <MangaSlideshow
          images={images}
          onClose={() => setShowSlideshow(false)}
          title={title}
          chapters={chapters}
          currentChapter={currentChapter}
          mangaId={mangaId}
        />
      )}

      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        {/* Header */}
        <AnimatePresence>
          {showControls && (
            <motion.header
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-0 left-0 right-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}
            >
              <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleBack}
                      className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                      title="Quay lại"
                    >
                      <FaArrowLeft />
                    </button>
                    <h1 className="text-lg font-semibold truncate">{title}</h1>
                  </div>

                <div className="flex items-center space-x-6">
                  <button
                    onClick={goToPreviousChapter}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} ${!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Chương trước"
                    disabled={!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) <= 0}
                  >
                    <FaArrowLeft />
                  </button>

                  <button
                    onClick={toggleChapterList}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                    title="Danh sách chương"
                  >
                    <FaList />
                  </button>

                  <button
                    onClick={() => setShowSlideshow(true)}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                    title="Chế độ trình chiếu"
                  >
                    <FaPlay />
                  </button>

                  <button
                    onClick={goToNextChapter}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} ${!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) >= chapters.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Chương tiếp theo"
                    disabled={!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) >= chapters.length - 1}
                  >
                    <FaArrowRight />
                  </button>

                  <button
                    onClick={handleGoHome}
                    className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                    title="Trang chủ"
                  >
                    <FaHome />
                  </button>
                </div>
              </div>
            </div>
          </motion.header>
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
            className={`fixed top-0 left-0 bottom-0 w-80 z-20 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Danh sách chương</h2>
                <button
                  onClick={toggleChapterList}
                  className={`text-xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
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
                        ? (darkMode ? 'bg-blue-900' : 'bg-blue-100')
                        : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                    }`}
                  >
                    <div className="font-medium">{chapter.title || `Chương ${chapter.number}`}</div>
                    {chapter.createdAt && (
                      <div className="text-sm opacity-70">
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

      {/* Main Content */}
      <div className="pt-16 pb-16">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* Hiển thị số trang đã tải / tổng số trang */}
            <div className="text-center mb-4">
              <span className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                Đang hiển thị {visibleImages.length} / {images ? images.length : 0} trang
              </span>
            </div>

            {/* Hiển thị các ảnh đã tải */}
            {visibleImages.map((image, index) => {
              const imageSrc = typeof image === 'string' ? image : image.url;
              return (
                <div key={index} className="flex justify-center mb-4 relative">
                  {/* Placeholder trước khi hình ảnh tải xong */}
                  <div
                    className="absolute inset-0 bg-gray-200 animate-pulse rounded shadow-lg"
                    style={{
                      minHeight: '300px',
                      aspectRatio: '2/3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="text-gray-500 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500 mx-auto mb-2"></div>
                      <div>Đang tải trang {index + 1}...</div>
                    </div>
                  </div>

                  {/* Hình ảnh thực tế với tối ưu hiệu suất */}
                  <img
                    src={imageSrc}
                    alt={`Trang ${index + 1}`}
                    className="max-w-full rounded shadow-lg relative z-10"
                    loading="lazy" // Sử dụng lazy loading cho tất cả ảnh
                    decoding="async" // Giải mã hình ảnh không đồng bộ
                    fetchpriority={index < 3 ? "high" : "auto"} // Chỉ ưu tiên 3 ảnh đầu tiên
                    onLoad={(e) => {
                      // Khi hình ảnh tải xong, ẩn placeholder
                      const parent = e.target.parentNode;
                      if (parent) {
                        const placeholder = parent.querySelector('div.absolute');
                        if (placeholder) {
                          placeholder.style.display = 'none';
                        }
                      }

                      // Thêm vào cache nếu có Service Worker
                      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        try {
                          navigator.serviceWorker.controller.postMessage({
                            type: 'CACHE_MANGA_IMAGE',
                            url: imageSrc
                          });
                        } catch (error) {
                          console.error('Error requesting image caching:', error);
                        }
                      }
                    }}
                    onError={(e) => {
                      console.error(`Error loading image: ${imageSrc}`);

                      // Thử tải lại với đường dẫn khác nếu là 001.jpg
                      if (imageSrc.includes('/001.jpg')) {
                        console.log('Trying alternative image path for first page');
                        e.target.src = imageSrc.replace('/001.jpg', '/002.jpg');
                      } else if (imageSrc.includes('/1.jpg')) {
                        e.target.src = imageSrc.replace('/1.jpg', '/2.jpg');
                      } else {
                        e.target.onerror = null;
                        e.target.src = '/images/default-manga-cover.svg';
                      }
                    }}
                    style={{
                      minHeight: '200px', // Đặt chiều cao tối thiểu để tránh layout shift
                      aspectRatio: '2/3', // Tỷ lệ khung hình phổ biến cho manga
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </div>
              );
            })}

            {/* Phần tử để theo dõi cuộn và tải thêm ảnh */}
            {hasMore && (
              <div
                ref={loadingRef}
                className="flex justify-center items-center py-4 h-20"
              >
                {loading && (
                  <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
                )}
              </div>
            )}

            {/* Hiển thị thông báo khi đã tải hết */}
            {!hasMore && visibleImages.length > 0 && (
              <div className="text-center py-4">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Đã tải hết tất cả trang
                </p>
                <button
                  onClick={scrollToTop}
                  className={`mt-2 px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  Về đầu trang
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.footer
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-0 left-0 right-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleDarkMode}
                    className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPreviousChapter}
                    className={`px-3 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white ${!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) <= 0}
                  >
                    Chương trước
                  </button>

                  <button
                    onClick={goToNextChapter}
                    className={`px-3 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white ${!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) >= chapters.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!chapters || chapters.findIndex(ch => ch._id === currentChapter?._id || ch.number === currentChapter?.number) >= chapters.length - 1}
                  >
                    Chương tiếp
                  </button>

                  <button
                    onClick={scrollToTop}
                    className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                    title="Lên đầu trang"
                  >
                    <FaChevronUp />
                  </button>
                </div>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default ImageBasedMangaViewer;
