import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaList, FaHome } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

/**
 * ImageViewer - Component hiển thị truyện tranh dạng ảnh
 * @param {Object} props
 * @param {Array} props.images - Mảng các đường dẫn ảnh
 * @param {Object} props.manga - Thông tin về manga
 * @param {Object} props.chapter - Thông tin về chapter hiện tại
 * @param {Array} props.chapters - Danh sách tất cả các chapter
 */
const ImageViewer = ({ images, manga, chapter, chapters }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const navigate = useNavigate();

  // Xử lý phím bấm
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, images]);

  // Xử lý cuộn trang
  useEffect(() => {
    const handleScroll = (e) => {
      // Ẩn controls khi cuộn xuống, hiện lại sau 2 giây
      setShowControls(false);
      clearTimeout(window.scrollTimer);
      window.scrollTimer = setTimeout(() => {
        setShowControls(true);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(window.scrollTimer);
    };
  }, []);

  // Chuyển đến trang trước
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    } else {
      // Nếu đang ở trang đầu tiên, chuyển đến chapter trước đó
      const currentIndex = chapters.findIndex(c => c.number === chapter.number);
      if (currentIndex > 0) {
        const prevChapter = chapters[currentIndex - 1];
        navigate(`/manga/${manga._id}/chapter/${prevChapter.number}`);
      }
    }
  };

  // Chuyển đến trang tiếp theo
  const nextPage = () => {
    if (currentPage < images.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    } else {
      // Nếu đang ở trang cuối cùng, chuyển đến chapter tiếp theo
      const currentIndex = chapters.findIndex(c => c.number === chapter.number);
      if (currentIndex < chapters.length - 1) {
        const nextChapter = chapters[currentIndex + 1];
        navigate(`/manga/${manga._id}/chapter/${nextChapter.number}`);
      }
    }
  };

  // Chuyển đổi chế độ toàn màn hình
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Chuyển đến chapter khác
  const goToChapter = (chapterNumber) => {
    navigate(`/manga/${manga._id}/chapter/${chapterNumber}`);
    setShowChapterList(false);
  };

  // Tìm chapter trước và sau
  const currentIndex = chapters.findIndex(c => c.number === chapter.number);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className={`image-viewer ${isFullscreen ? 'fixed inset-0 bg-black z-50' : 'relative'}`}>
      {/* Thanh điều khiển phía trên */}
      <div className={`top-controls fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-80 text-white p-3 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to={`/manga/${manga._id}`} className="flex items-center">
              <FaHome className="mr-2" /> Về trang truyện
            </Link>
            <button 
              onClick={() => setShowChapterList(!showChapterList)}
              className="flex items-center"
            >
              <FaList className="mr-2" /> Danh sách chương
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-bold">{manga.title} - {chapter.title}</h1>
            <p className="text-sm">Trang {currentPage + 1}/{images.length}</p>
          </div>
          <div className="flex items-center space-x-4">
            {prevChapter && (
              <button 
                onClick={() => goToChapter(prevChapter.number)}
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
              >
                Chương trước
              </button>
            )}
            {nextChapter && (
              <button 
                onClick={() => goToChapter(nextChapter.number)}
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
              >
                Chương sau
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách chapter */}
      {showChapterList && (
        <div className="chapter-list fixed top-16 left-0 right-0 bg-white z-30 shadow-lg max-h-96 overflow-y-auto">
          <div className="container mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Danh sách chương</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {chapters.map((c) => (
                <button
                  key={c.number}
                  onClick={() => goToChapter(c.number)}
                  className={`p-2 rounded text-left ${c.number === chapter.number ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Chương {c.number}: {c.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị ảnh */}
      <div className="image-container mt-16 mb-16 flex flex-col items-center">
        {images.length > 0 ? (
          <img
            src={images[currentPage]}
            alt={`Trang ${currentPage + 1}`}
            className="max-w-full"
            onClick={nextPage}
          />
        ) : (
          <div className="text-center p-10">
            <p className="text-xl">Không tìm thấy ảnh cho chương này.</p>
          </div>
        )}
      </div>

      {/* Thanh điều khiển phía dưới */}
      <div className={`bottom-controls fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 text-white p-3 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={prevPage}
            disabled={currentPage === 0 && !prevChapter}
            className={`px-4 py-2 rounded flex items-center ${currentPage === 0 && !prevChapter ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <FaArrowLeft className="mr-2" /> Trang trước
          </button>
          <div className="text-center">
            <input
              type="range"
              min="0"
              max={images.length - 1}
              value={currentPage}
              onChange={(e) => {
                setCurrentPage(parseInt(e.target.value));
                window.scrollTo(0, 0);
              }}
              className="w-40 md:w-80"
            />
            <p className="text-sm mt-1">Trang {currentPage + 1}/{images.length}</p>
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === images.length - 1 && !nextChapter}
            className={`px-4 py-2 rounded flex items-center ${currentPage === images.length - 1 && !nextChapter ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Trang sau <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
