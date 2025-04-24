import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaEye } from 'react-icons/fa';
import CBZReader from './CBZReader';
import axios from 'axios';

/**
 * CBZStoryViewer - Component để hiển thị truyện từ file CBZ
 */
const CBZStoryViewer = () => {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReader, setShowReader] = useState(false);
  
  // Lấy thông tin truyện
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        
        // Trong môi trường thực tế, bạn sẽ gọi API để lấy thông tin truyện
        // Ở đây chúng ta giả lập dữ liệu
        
        // Giả lập gọi API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dữ liệu mẫu
        const sampleStory = {
          id: storyId,
          title: `Truyện CBZ ${storyId}`,
          author: 'Tác giả mẫu',
          description: 'Đây là một truyện được import từ file CBZ. Truyện có nhiều hình ảnh đẹp và nội dung hấp dẫn.',
          genre: 'Manga',
          status: 'ongoing',
          type: 'normal',
          coverImage: 'https://via.placeholder.com/300x400',
          cbzUrl: '/sample.cbz', // URL của file CBZ
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 1234,
          likes: 567,
          chapters: [
            {
              id: 1,
              number: 1,
              title: 'Chapter 1',
              createdAt: new Date().toISOString()
            }
          ]
        };
        
        setStory(sampleStory);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Không thể tải thông tin truyện');
        setLoading(false);
      }
    };
    
    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  // Xử lý khi click vào nút đọc truyện
  const handleReadStory = () => {
    setShowReader(true);
  };

  // Xử lý khi đóng reader
  const handleCloseReader = () => {
    setShowReader(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (showReader && story) {
    return (
      <CBZReader 
        cbzUrl={story.cbzUrl} 
        title={story.title} 
        onClose={handleCloseReader} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline flex items-center">
          <FaArrowLeft className="mr-2" /> Quay lại trang chủ
        </Link>
      </div>
      
      {story && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-4">
              <img 
                src={story.coverImage} 
                alt={story.title}
                className="w-full h-auto rounded-lg shadow-md"
              />
              
              <div className="mt-4">
                <button
                  onClick={handleReadStory}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <FaBook className="mr-2" /> Đọc truyện
                </button>
              </div>
              
              <div className="mt-4 flex justify-between text-gray-600">
                <div className="flex items-center">
                  <FaEye className="mr-1" /> {story.views.toLocaleString()}
                </div>
                <div>
                  Thể loại: {story.genre}
                </div>
                <div>
                  Trạng thái: {story.status === 'ongoing' ? 'Đang tiến hành' : 'Hoàn thành'}
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
              <p className="text-gray-600 mb-4">Tác giả: {story.author}</p>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Giới thiệu</h2>
                <p className="text-gray-700">{story.description}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Danh sách chương</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {story.chapters.map((chapter) => (
                    <div 
                      key={chapter.id}
                      className="py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <button
                        onClick={handleReadStory}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Chapter {chapter.number}: {chapter.title}
                      </button>
                      <p className="text-sm text-gray-500">
                        Cập nhật: {new Date(chapter.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CBZStoryViewer;
