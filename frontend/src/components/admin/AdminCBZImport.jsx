import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaFileArchive } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import CBZImporter from './CBZImporter';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * AdminCBZImport - Trang quản lý import CBZ trong admin dashboard
 */
const AdminCBZImport = () => {
  const [importedStories, setImportedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách truyện đã import
  const fetchImportedStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cbz/imported');
      setImportedStories(response.data);
    } catch (error) {
      console.error('Error fetching imported stories:', error);
      toast.error('Không thể tải danh sách truyện đã import');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchImportedStories();
  }, []);

  // Xử lý khi import hoàn tất
  const handleImportComplete = () => {
    fetchImportedStories();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Import CBZ</h1>
        <Link to="/admin" className="flex items-center text-blue-600 hover:text-blue-800">
          <FaArrowLeft className="mr-2" />
          Quay lại Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CBZImporter onImportComplete={handleImportComplete} />
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Truyện đã import</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : importedStories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaFileArchive className="mx-auto text-4xl mb-2" />
                <p>Chưa có truyện nào được import</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {importedStories.map(story => (
                  <div key={story._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {story.thumbnail ? (
                      <img 
                        src={story.thumbnail} 
                        alt={story.title} 
                        className="w-12 h-16 object-cover rounded mr-3"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center mr-3">
                        <FaFileArchive className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{story.title}</h3>
                      <p className="text-sm text-gray-500">{story.author}</p>
                      <div className="flex mt-1">
                        <Link 
                          to={`/story/${story._id}`} 
                          className="text-xs text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Xem
                        </Link>
                        <span className="text-xs text-gray-500">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCBZImport;
