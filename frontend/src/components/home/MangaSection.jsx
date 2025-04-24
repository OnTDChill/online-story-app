import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MangaService from '../../services/MangaService';
import { FaEye, FaHeart, FaStar, FaBookOpen } from 'react-icons/fa';

/**
 * MangaSection - Hiển thị danh sách truyện mẫu trên trang chủ
 */
const MangaSection = ({ title, subtitle }) => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const data = await MangaService.getMangas();
        // Đảm bảo data là một mảng
        if (Array.isArray(data)) {
          setMangas(data);
        } else {
          console.error('Data is not an array:', data);
          setMangas([]);
        }
      } catch (error) {
        console.error('Error fetching mangas:', error);
        setMangas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{subtitle}</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (mangas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{subtitle}</p>
        <div className="text-center py-8">
          <p className="text-gray-500">Không có truyện nào được tìm thấy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <Link to="/advanced-filter" className="text-blue-600 hover:underline">
          Xem tất cả
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mangas.map((manga) => (
          <div key={manga._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <Link to={`/story/${manga._id}`} className="block relative">
              <img
                src={manga.thumbnail || 'https://via.placeholder.com/300x400?text=No+Image'}
                alt={manga.title}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x400?text=Error';
                }}
              />
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1">
                {manga.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <div className="flex justify-between text-white text-xs">
                  <span className="flex items-center">
                    <FaEye className="mr-1" />
                    {manga.views > 1000 ? `${(manga.views / 1000).toFixed(1)}K` : manga.views}
                  </span>
                  <span className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    {manga.rating}
                  </span>
                </div>
              </div>
            </Link>

            <div className="p-2">
              <Link
                to={`/story/${manga._id}`}
                className="font-medium text-sm hover:text-blue-600 line-clamp-1"
              >
                {manga.title}
              </Link>
              <p className="text-xs text-gray-600 mb-1">{manga.author}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {manga.genre.split(',')[0]}
                </span>
                <span className="text-gray-500">
                  {manga.chapters} chương
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MangaSection;
