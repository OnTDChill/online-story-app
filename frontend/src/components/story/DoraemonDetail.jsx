import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBookOpen, FaEye, FaStar, FaCalendarAlt, FaUser, FaTags } from 'react-icons/fa';
import SimplePDFViewer from '../reader/SimplePDFViewer';
import MangaService from '../../services/MangaService';
import { toast } from 'react-toastify';

/**
 * DoraemonDetail - Component hiển thị chi tiết truyện Doraemon
 */
const DoraemonDetail = () => {
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const navigate = useNavigate();

  // Lấy dữ liệu truyện
  useEffect(() => {
    const fetchStoryData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin truyện từ dữ liệu local
        const mangaData = await MangaService.getManga('doraemon');
        if (mangaData) {
          setStory(mangaData);

          // Lấy danh sách chương từ dữ liệu local
          const chaptersData = await MangaService.getChapters('doraemon');
          if (chaptersData) {
            setChapters(chaptersData);
          }
        } else {
          toast.error('Không thể tải thông tin truyện Doraemon');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu truyện:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu truyện');
      } finally {
        setLoading(false);
      }
    };

    fetchStoryData();
  }, []);

  // Xử lý khi chọn một chương để đọc
  const handleReadChapter = (chapter) => {
    console.log('Chuyển đến chương:', chapter);
    navigate(`/doraemon/chapter/${chapter.number}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Nút quay lại */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Quay lại trang chủ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : story ? (
        <div>
          {/* Thông tin truyện */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="md:flex">
              {/* Ảnh bìa */}
              <div className="md:w-1/3 p-6">
                <img
                  src={story.thumbnail}
                  alt={story.title}
                  className="w-full h-auto rounded-lg shadow-md"
                />

                <div className="mt-6 flex justify-between text-gray-600 text-sm">
                  <div className="flex items-center">
                    <FaEye className="mr-1" /> {story.views.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <FaStar className="mr-1 text-yellow-500" /> {story.rating}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleReadChapter(chapters[0])}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                  >
                    <FaBookOpen className="mr-2" /> Đọc từ đầu
                  </button>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="md:w-2/3 p-6">
                <h1 className="text-3xl font-bold mb-4">{story.title}</h1>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FaUser className="mr-2" /> <span className="font-semibold">Tác giả:</span> {story.author}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2" /> <span className="font-semibold">Năm xuất bản:</span> {story.releaseYear}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaTags className="mr-2" /> <span className="font-semibold">Thể loại:</span> {story.genres.join(', ')}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-semibold">Trạng thái:</span> {story.status}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Giới thiệu</h2>
                  <p className="text-gray-700 leading-relaxed">{story.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách chương */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Danh sách tập</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => (
                <div
                  key={chapter._id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition duration-200"
                  onClick={() => handleReadChapter(chapter)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{chapter.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Truyện liên quan */}
          {story.relatedStories && story.relatedStories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Truyện liên quan</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {story.relatedStories.map((relatedStory) => (
                  <Link
                    key={relatedStory._id}
                    to={`/story/${relatedStory._id}`}
                    className="block"
                  >
                    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition duration-200">
                      <img
                        src={relatedStory.thumbnail}
                        alt={relatedStory.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2">{relatedStory.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-red-500 p-8">
          <p>Không thể tải thông tin truyện. Vui lòng thử lại sau.</p>
        </div>
      )}
    </div>
  );
};

export default DoraemonDetail;
