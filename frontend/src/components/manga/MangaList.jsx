import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaStar, FaBookOpen } from 'react-icons/fa';
import MangaService from '../../services/MangaService';

/**
 * Component hiển thị danh sách manga với phân trang và tải theo yêu cầu
 */
const MangaList = () => {
  const [mangas, setMangas] = useState([]);
  const [filteredMangas, setFilteredMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loadedImages, setLoadedImages] = useState({});

  // Lấy danh sách manga
  useEffect(() => {
    const fetchMangas = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra xem đã có danh sách manga trong localStorage chưa
        const cachedMangas = localStorage.getItem('mangaList');
        const cacheTimestamp = localStorage.getItem('mangaListTimestamp');
        
        if (cachedMangas && cacheTimestamp) {
          const now = Date.now();
          const cacheTime = parseInt(cacheTimestamp);
          const cacheAge = now - cacheTime;
          
          // Cache hợp lệ trong 1 giờ (3600000 ms)
          if (cacheAge < 3600000) {
            console.log('Using cached manga list from localStorage');
            try {
              const mangaData = JSON.parse(cachedMangas);
              processMangas(mangaData);
              return;
            } catch (error) {
              console.error('Error parsing cached manga list:', error);
              // Nếu có lỗi khi parse cache, tiếp tục với API call
            }
          }
        }
        
        // Lấy danh sách manga từ service
        const mangaData = await MangaService.getMangas();
        
        // Lưu vào localStorage để sử dụng lần sau
        localStorage.setItem('mangaList', JSON.stringify(mangaData));
        localStorage.setItem('mangaListTimestamp', Date.now().toString());
        
        processMangas(mangaData);
      } catch (error) {
        console.error('Error fetching manga list:', error);
        setError('Đã xảy ra lỗi khi tải danh sách truyện. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    // Xử lý dữ liệu manga
    const processMangas = (data) => {
      if (Array.isArray(data) && data.length > 0) {
        // Lưu danh sách manga
        setMangas(data);
        setFilteredMangas(data);
        
        // Tính tổng số trang
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        
        // Lấy danh sách thể loại
        const allGenres = new Set();
        data.forEach(manga => {
          if (manga.genres && Array.isArray(manga.genres)) {
            manga.genres.forEach(genre => allGenres.add(genre));
          } else if (manga.genre) {
            allGenres.add(manga.genre);
          }
        });
        setGenres(Array.from(allGenres).sort());
        
        setLoading(false);
      } else {
        setMangas([]);
        setFilteredMangas([]);
        setTotalPages(1);
        setGenres([]);
        setLoading(false);
      }
    };
    
    fetchMangas();
  }, [itemsPerPage]);
  
  // Lọc và sắp xếp manga khi có thay đổi
  useEffect(() => {
    filterAndSortMangas();
  }, [searchTerm, selectedGenre, sortBy, sortOrder, mangas]);
  
  // Hàm lọc và sắp xếp manga
  const filterAndSortMangas = useCallback(() => {
    let filtered = [...mangas];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(manga => 
        manga.title.toLowerCase().includes(term) || 
        (manga.author && manga.author.toLowerCase().includes(term))
      );
    }
    
    // Lọc theo thể loại
    if (selectedGenre) {
      filtered = filtered.filter(manga => {
        if (manga.genres && Array.isArray(manga.genres)) {
          return manga.genres.includes(selectedGenre);
        } else if (manga.genre) {
          return manga.genre === selectedGenre;
        }
        return false;
      });
    }
    
    // Sắp xếp
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'title':
          valueA = a.title || '';
          valueB = b.title || '';
          break;
        case 'views':
          valueA = a.views || 0;
          valueB = b.views || 0;
          break;
        case 'rating':
          valueA = a.rating || 0;
          valueB = b.rating || 0;
          break;
        case 'chapters':
          valueA = a.chapters || 0;
          valueB = b.chapters || 0;
          break;
        default:
          valueA = a.title || '';
          valueB = b.title || '';
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
    
    setFilteredMangas(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset về trang đầu tiên khi lọc
  }, [mangas, searchTerm, selectedGenre, sortBy, sortOrder, itemsPerPage]);
  
  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Xử lý thay đổi số lượng item mỗi trang
  const handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset về trang đầu tiên
  };
  
  // Xử lý thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Xử lý thay đổi thể loại
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };
  
  // Xử lý thay đổi sắp xếp
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  // Xử lý thay đổi thứ tự sắp xếp
  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Xử lý khi hình ảnh tải xong
  const handleImageLoad = (mangaId) => {
    setLoadedImages(prev => ({
      ...prev,
      [mangaId]: true
    }));
  };
  
  // Lấy danh sách manga cho trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMangas.slice(startIndex, endIndex);
  };
  
  // Tạo các nút phân trang
  const renderPagination = () => {
    const pages = [];
    
    // Hiển thị tối đa 5 nút trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Nút trang đầu
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-1 mx-1">
            ...
          </span>
        );
      }
    }
    
    // Các nút trang
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Nút trang cuối
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-1 mx-1">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách truyện...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Danh sách truyện</h1>
      
      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tìm kiếm */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Nhập tên truyện hoặc tác giả"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Lọc theo thể loại */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
              Thể loại
            </label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={handleGenreChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả thể loại</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sắp xếp theo */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp theo
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Tên truyện</option>
              <option value="views">Lượt xem</option>
              <option value="rating">Đánh giá</option>
              <option value="chapters">Số chương</option>
            </select>
          </div>
          
          {/* Số lượng hiển thị */}
          <div>
            <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
              Hiển thị
            </label>
            <div className="flex items-center">
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={12}>12 truyện</option>
                <option value={24}>24 truyện</option>
                <option value={36}>36 truyện</option>
                <option value={48}>48 truyện</option>
              </select>
              
              <button
                onClick={handleSortOrderChange}
                className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                title={sortOrder === 'asc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hiển thị kết quả lọc */}
      <div className="mb-4 text-gray-600">
        Hiển thị {filteredMangas.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredMangas.length)} của {filteredMangas.length} truyện
      </div>
      
      {/* Danh sách manga */}
      {filteredMangas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {getCurrentPageItems().map(manga => (
            <div key={manga._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/manga/${manga._id}`} className="block">
                <div className="relative pb-[140%] overflow-hidden bg-gray-200">
                  {/* Placeholder khi hình ảnh đang tải */}
                  {!loadedImages[manga._id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <img
                    src={manga.thumbnail || '/images/default-manga-cover.svg'}
                    alt={manga.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loadedImages[manga._id] ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => handleImageLoad(manga._id)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-manga-cover.svg';
                      handleImageLoad(manga._id);
                    }}
                  />
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-12" title={manga.title}>
                    {manga.title}
                  </h3>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <FaBookOpen className="mr-1" />
                    <span>{manga.chapters || 0} chương</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span>{manga.rating || 5.0}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaEye className="text-blue-500 mr-1" />
                      <span>{(manga.views || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-lg">Không tìm thấy truyện nào phù hợp với tiêu chí tìm kiếm.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('');
              setSortBy('title');
              setSortOrder('asc');
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
      
      {/* Phân trang */}
      {filteredMangas.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap">
            {/* Nút trang trước */}
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              &laquo;
            </button>
            
            {/* Các nút trang */}
            {renderPagination()}
            
            {/* Nút trang sau */}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MangaList;
