import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { FaArrowLeft, FaArrowRight, FaList, FaHome, FaExpand, FaCompress } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * CBZReader - Component để đọc và hiển thị file CBZ (Comic Book ZIP)
 * @param {Object} props
 * @param {string} props.cbzUrl - URL của file CBZ cần đọc
 * @param {string} props.title - Tiêu đề của truyện
 * @param {function} props.onClose - Hàm được gọi khi đóng reader
 */
const CBZReader = ({ cbzUrl, title, onClose }) => {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);

  // Đọc file CBZ
  useEffect(() => {
    const loadCBZ = async () => {
      try {
        setLoading(true);
        
        // Tải file CBZ
        const response = await fetch(cbzUrl);
        if (!response.ok) {
          throw new Error(`Failed to load CBZ file: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Sử dụng JSZip để giải nén
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(arrayBuffer);
        
        // Lọc ra các file hình ảnh và sắp xếp theo tên
        const imageFiles = Object.keys(zipContent.files)
          .filter(filename => 
            !zipContent.files[filename].dir && 
            /\.(jpe?g|png|gif|webp)$/i.test(filename)
          )
          .sort((a, b) => {
            // Sắp xếp theo số tự nhiên (001.jpg, 002.jpg, ..., 010.jpg, ...)
            const numA = parseInt(a.match(/\d+/) || '0');
            const numB = parseInt(b.match(/\d+/) || '0');
            return numA - numB;
          });
        
        if (imageFiles.length === 0) {
          throw new Error('No images found in the CBZ file');
        }
        
        // Đọc từng file hình ảnh và chuyển thành URL
        const imagePromises = imageFiles.map(async filename => {
          const file = zipContent.files[filename];
          const blob = await file.async('blob');
          return {
            name: filename,
            url: URL.createObjectURL(blob)
          };
        });
        
        const imageUrls = await Promise.all(imagePromises);
        setImages(imageUrls);
        setLoading(false);
      } catch (err) {
        console.error('Error loading CBZ:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (cbzUrl) {
      loadCBZ();
    }
    
    // Cleanup function để giải phóng các URL khi component unmount
    return () => {
      images.forEach(image => {
        if (image.url) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [cbzUrl]);

  // Xử lý phím bấm để điều hướng
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        // Phím mũi tên phải hoặc Space: trang tiếp theo
        if (currentPage < images.length - 1) {
          setCurrentPage(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        // Phím mũi tên trái: trang trước
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        // Phím F: toàn màn hình
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        // Phím Escape: thoát toàn màn hình
        if (fullscreen) {
          setFullscreen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, images.length, fullscreen]);

  // Xử lý toàn màn hình
  const toggleFullscreen = () => {
    if (!fullscreen) {
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
    }
    setFullscreen(!fullscreen);
  };

  // Xử lý khi click vào hình ảnh
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Click vào 1/3 bên trái: trang trước
    if (x < width / 3) {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    } 
    // Click vào 1/3 bên phải: trang tiếp theo
    else if (x > (width * 2) / 3) {
      if (currentPage < images.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    } 
    // Click vào giữa: hiện/ẩn thanh điều khiển
    else {
      setShowControls(!showControls);
    }
  };

  // Chuyển đến trang trước
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Chuyển đến trang tiếp theo
  const goToNextPage = () => {
    if (currentPage < images.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Chuyển đến trang cụ thể
  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < images.length) {
      setCurrentPage(pageIndex);
      setShowThumbnails(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Đang tải truyện...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="bg-red-800 text-white p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Lỗi khi tải truyện</h2>
          <p>{error}</p>
          <button 
            onClick={onClose} 
            className="mt-4 bg-white text-red-800 px-4 py-2 rounded hover:bg-gray-200"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Hình ảnh chính */}
      <div 
        className="h-full w-full flex items-center justify-center relative"
        onClick={handleImageClick}
      >
        {images.length > 0 && (
          <img 
            src={images[currentPage].url} 
            alt={`Page ${currentPage + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        )}
        
        {/* Chỉ báo trang */}
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          Trang {currentPage + 1} / {images.length}
        </div>
      </div>
      
      {/* Thanh điều khiển */}
      <div className={`absolute top-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 flex justify-between items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-blue-300">
            <FaHome size={20} />
          </Link>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowThumbnails(!showThumbnails)} 
            className="text-white hover:text-blue-300"
            title="Hiện/ẩn danh sách trang"
          >
            <FaList size={20} />
          </button>
          
          <button 
            onClick={toggleFullscreen} 
            className="text-white hover:text-blue-300"
            title={fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            {fullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
          </button>
        </div>
      </div>
      
      {/* Nút điều hướng */}
      <button 
        onClick={goToPreviousPage}
        disabled={currentPage === 0}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-70'}`}
      >
        <FaArrowLeft size={24} />
      </button>
      
      <button 
        onClick={goToNextPage}
        disabled={currentPage === images.length - 1}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} ${currentPage === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-70'}`}
      >
        <FaArrowRight size={24} />
      </button>
      
      {/* Danh sách trang (thumbnails) */}
      {showThumbnails && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4 overflow-x-auto">
          <div className="flex space-x-2">
            {images.map((image, index) => (
              <div 
                key={index}
                onClick={() => goToPage(index)}
                className={`cursor-pointer transition-all duration-200 ${currentPage === index ? 'border-2 border-blue-500 transform scale-105' : 'border border-gray-700'}`}
              >
                <img 
                  src={image.url} 
                  alt={`Thumbnail ${index + 1}`}
                  className="h-24 object-contain"
                />
                <div className="text-white text-center text-xs mt-1">{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CBZReader;
