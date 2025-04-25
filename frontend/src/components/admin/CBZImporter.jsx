import React, { useState, useEffect } from 'react';
import { FaUpload, FaFileArchive, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * CBZImporter - Component để tải lên và xử lý file CBZ
 * @param {Object} props
 * @param {function} props.onImportComplete - Callback khi import hoàn tất
 */
const CBZImporter = ({ onImportComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({});

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.name.toLowerCase().endsWith('.cbz')
    );

    if (files.length === 0) {
      toast.error('Vui lòng chọn file CBZ hợp lệ');
      return;
    }

    // Khởi tạo trạng thái tiến trình cho mỗi file
    const newProgress = {};
    files.forEach(file => {
      newProgress[file.name] = {
        status: 'pending', // 'pending', 'processing', 'success', 'error'
        message: 'Đang chờ xử lý',
        progress: 0
      };
    });

    setSelectedFiles(files);
    setProgress(newProgress);
  };

  // Xử lý khi tải lên file
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một file CBZ');
      return;
    }

    setProcessing(true);

    for (const file of selectedFiles) {
      try {
        // Cập nhật trạng thái
        setProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'processing',
            message: 'Đang xử lý file...',
            progress: 10
          }
        }));

        // Tạo FormData để gửi lên server
        const formData = new FormData();
        formData.append('cbzFile', file);

        console.log('Sending file:', file.name, 'Size:', file.size);

        // Lấy thông tin cơ bản từ tên file
        const fileName = file.name.replace('.cbz', '');
        formData.append('title', fileName);
        formData.append('author', 'Unknown');
        formData.append('description', `Truyện được import từ file CBZ: ${fileName}`);
        formData.append('genre', 'Manga');
        formData.append('status', 'ongoing');
        formData.append('type', 'normal');
        formData.append('number_of_chapters', '1');

        // Cập nhật trạng thái
        setProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            message: 'Đang tải lên file...',
            progress: 30
          }
        }));

        // Kiểm tra kết nối với server trước
        try {
          const testResponse = await axios.get('/api/cbz-test');
          console.log('Test response:', testResponse.data);
        } catch (error) {
          console.error('Test connection failed:', error);
        }

        // Gửi request lên server
        console.log('Sending file to /api/cbz/simple-import');
        const response = await axios.post('/api/cbz/simple-import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 50) / progressEvent.total);

            setProgress(prev => ({
              ...prev,
              [file.name]: {
                ...prev[file.name],
                message: 'Đang tải lên file...',
                progress: 30 + percentCompleted
              }
            }));
          }
        });

        // Cập nhật trạng thái
        setProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            message: 'Đang xử lý trên server...',
            progress: 80
          }
        }));

        // Kiểm tra kết quả từ server
        if (response.data.success) {
          // Cập nhật trạng thái
          setProgress(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              status: 'success',
              message: 'Tải lên thành công',
              progress: 100
            }
          }));

          toast.success(response.data.message || `Đã import thành công: ${fileName}`);
        } else {
          throw new Error(response.data.message || 'Lỗi không xác định từ server');
        }

      } catch (error) {
        console.error('Error processing CBZ file:', error);

        // Cập nhật trạng thái
        setProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'error',
            message: `Lỗi: ${error.response?.data?.message || error.message}`,
            progress: 0
          }
        }));

        toast.error(`Lỗi khi xử lý file ${file.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    setProcessing(false);

    // Kiểm tra xem tất cả các file đã được xử lý thành công chưa
    const allSuccess = Object.values(progress).every(p => p.status === 'success');
    if (allSuccess && onImportComplete) {
      onImportComplete();
    }
  };

  // Xóa file khỏi danh sách
  const removeFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  // Hiển thị biểu tượng trạng thái
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'error':
        return <FaTimes className="text-red-500" />;
      case 'processing':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      default:
        return <FaFileArchive className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Import Truyện từ CBZ</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn file CBZ
        </label>

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FaUpload className="w-8 h-8 mb-3 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click để chọn file</span> hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-gray-500">
                Chỉ hỗ trợ file CBZ (Comic Book ZIP)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".cbz"
              multiple
              onChange={handleFileChange}
              disabled={processing}
            />
          </label>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">File đã chọn</h3>

          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  {renderStatusIcon(progress[file.name]?.status)}
                  <span className="ml-2 font-medium">{file.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>

                <div className="flex items-center">
                  {progress[file.name]?.status === 'processing' && (
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-4">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${progress[file.name]?.progress || 0}%` }}
                      ></div>
                    </div>
                  )}

                  {progress[file.name]?.status !== 'processing' && (
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-red-500 hover:text-red-700"
                      disabled={processing}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || processing}
          className={`flex items-center px-4 py-2 rounded-md text-white ${
            selectedFiles.length === 0 || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {processing ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Đang xử lý...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" />
              Tải lên
            </>
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Hướng dẫn</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>File CBZ là file ZIP chứa các hình ảnh của truyện tranh</li>
          <li>Hệ thống sẽ tự động sắp xếp các hình ảnh theo thứ tự số</li>
          <li>Tên file CBZ sẽ được sử dụng làm tiêu đề truyện</li>
          <li>Hỗ trợ các định dạng hình ảnh: JPG, PNG, GIF, WebP</li>
        </ul>
      </div>
    </div>
  );
};

export default CBZImporter;
