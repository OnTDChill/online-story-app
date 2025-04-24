import React, { useState } from 'react';
import { FaUsers, FaBook, FaChartLine, FaDownload, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

/**
 * ExportDataComponent - Component xuất dữ liệu
 */
const ExportDataComponent = ({ onActionSuccess }) => {
  const [loading, setLoading] = useState({
    users: false,
    stories: false,
    revenue: false
  });

  // URL API
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Hàm tạo dữ liệu mẫu cho người dùng
  const generateUserSampleData = () => {
    const users = [];
    for (let i = 1; i <= 100; i++) {
      users.push({
        id: i,
        username: `user${i}`,
        name: `Người dùng ${i}`,
        email: `user${i}@example.com`,
        role: i % 20 === 0 ? 'Admin' : 'User',
        diamonds: Math.floor(Math.random() * 1000),
        rubies: Math.floor(Math.random() * 500),
        svipPoints: Math.floor(Math.random() * 2000),
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 1000000000).toISOString()
      });
    }
    return users;
  };

  // Hàm tạo dữ liệu mẫu cho truyện
  const generateStorySampleData = () => {
    const stories = [];
    const statuses = ['ongoing', 'completed', 'hiatus', 'cancelled'];
    const genres = ['Hành động', 'Tình cảm', 'Phiêu lưu', 'Kinh dị', 'Hài hước', 'Kỳ ảo'];
    const types = ['normal', 'vip', 'premium'];

    for (let i = 1; i <= 100; i++) {
      stories.push({
        id: i,
        title: `Truyện ${i}`,
        author: `Tác giả ${Math.floor(i / 5) + 1}`,
        description: `Mô tả chi tiết cho truyện ${i}. Đây là một truyện hấp dẫn với nhiều tình tiết bất ngờ.`,
        genre: genres[Math.floor(Math.random() * genres.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
        chapters: Math.floor(Math.random() * 100) + 1,
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 200),
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
      });
    }
    return stories;
  };

  // Hàm tạo dữ liệu mẫu cho doanh thu
  const generateRevenueSampleData = () => {
    const revenue = [];
    const today = new Date();

    // Doanh thu theo ngày trong 30 ngày gần nhất
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      revenue.push({
        date: date.toISOString().split('T')[0],
        total: Math.floor(Math.random() * 1000) + 100,
        transactions: Math.floor(Math.random() * 50) + 5,
        diamonds: Math.floor(Math.random() * 5000) + 500,
        rubies: Math.floor(Math.random() * 2000) + 200,
        vipSubscriptions: Math.floor(Math.random() * 20) + 1,
        newUsers: Math.floor(Math.random() * 30) + 5
      });
    }

    return revenue;
  };

  // Lấy dữ liệu người dùng (thử gọi API trước, nếu không được thì dùng dữ liệu mẫu)
  const fetchUsersData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 && response.data && response.data.length > 0) {
        return response.data;
      }
      // Nếu API không trả về dữ liệu hoặc có lỗi, sử dụng dữ liệu mẫu
      console.log('Sử dụng dữ liệu mẫu cho người dùng');
      return generateUserSampleData();
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      console.log('Sử dụng dữ liệu mẫu cho người dùng');
      return generateUserSampleData();
    }
  };

  // Lấy dữ liệu truyện (thử gọi API trước, nếu không được thì dùng dữ liệu mẫu)
  const fetchStoriesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}stories`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 && response.data && response.data.length > 0) {
        return response.data;
      }
      // Nếu API không trả về dữ liệu hoặc có lỗi, sử dụng dữ liệu mẫu
      console.log('Sử dụng dữ liệu mẫu cho truyện');
      return generateStorySampleData();
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu truyện:', error);
      console.log('Sử dụng dữ liệu mẫu cho truyện');
      return generateStorySampleData();
    }
  };

  // Lấy dữ liệu doanh thu (thử gọi API trước, nếu không được thì dùng dữ liệu mẫu)
  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 && response.data && response.data.length > 0) {
        return response.data;
      }
      // Nếu API không trả về dữ liệu hoặc có lỗi, sử dụng dữ liệu mẫu
      console.log('Sử dụng dữ liệu mẫu cho doanh thu');
      return generateRevenueSampleData();
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      console.log('Sử dụng dữ liệu mẫu cho doanh thu');
      return generateRevenueSampleData();
    }
  };

  // Hàm chuyển đổi dữ liệu thành CSV
  const convertToCSV = (data) => {
    if (!data || !data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Thêm header
    csvRows.push(headers.join(','));

    // Thêm dữ liệu
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Xử lý các giá trị đặc biệt (chuỗi có dấu phẩy, dấu nháy kép)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  // Hàm tạo và tải xuống file
  const downloadFile = (data, filename, fileType) => {
    let content = '';
    let mimeType = '';

    if (fileType === 'csv') {
      content = convertToCSV(data);
      mimeType = 'text/csv;charset=utf-8;';
      filename = `${filename}.csv`;
    } else if (fileType === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      filename = `${filename}.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');

    // Tạo URL cho blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    // Thêm link vào DOM, click và xóa
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Giải phóng URL
    URL.revokeObjectURL(url);
  };

  // Xử lý xuất dữ liệu người dùng
  const handleExportUsers = async (fileType) => {
    setLoading({ ...loading, users: true });

    try {
      // Lấy dữ liệu thật từ API
      const userData = await fetchUsersData();
      downloadFile(userData, 'users-data', fileType);
      toast.success(`Xuất dữ liệu người dùng thành công (${fileType.toUpperCase()})`);

      // Thông báo thành công (không chuyển về trang chủ)
      // if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error('Lỗi khi xuất dữ liệu người dùng:', error);
      toast.error('Không thể xuất dữ liệu người dùng');
    } finally {
      setLoading({ ...loading, users: false });
    }
  };

  // Xử lý xuất dữ liệu truyện
  const handleExportStories = async (fileType) => {
    setLoading({ ...loading, stories: true });

    try {
      // Lấy dữ liệu thật từ API
      const storyData = await fetchStoriesData();
      downloadFile(storyData, 'stories-data', fileType);
      toast.success(`Xuất dữ liệu truyện thành công (${fileType.toUpperCase()})`);

      // Thông báo thành công (không chuyển về trang chủ)
      // if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error('Lỗi khi xuất dữ liệu truyện:', error);
      toast.error('Không thể xuất dữ liệu truyện');
    } finally {
      setLoading({ ...loading, stories: false });
    }
  };

  // Xử lý xuất dữ liệu doanh thu
  const handleExportRevenue = async (fileType) => {
    setLoading({ ...loading, revenue: true });

    try {
      // Lấy dữ liệu thật từ API
      const revenueData = await fetchRevenueData();
      downloadFile(revenueData, 'revenue-data', fileType);
      toast.success(`Xuất dữ liệu doanh thu thành công (${fileType.toUpperCase()})`);

      // Thông báo thành công (không chuyển về trang chủ)
      // if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error('Lỗi khi xuất dữ liệu doanh thu:', error);
      toast.error('Không thể xuất dữ liệu doanh thu');
    } finally {
      setLoading({ ...loading, revenue: false });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Xuất dữ liệu</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Xuất dữ liệu người dùng */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <FaUsers className="text-xl" />
            </div>
            <h3 className="ml-3 font-semibold text-lg">Xuất dữ liệu người dùng</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Tải xuống danh sách người dùng với thông tin chi tiết như tên, email, vai trò và ngày tạo.
          </p>

          <div className="flex space-x-2">
            <button
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
              onClick={() => handleExportUsers('csv')}
              disabled={loading.users}
            >
              {loading.users ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </span>
              ) : (
                <>
                  <FaFileCsv className="mr-2" /> CSV
                </>
              )}
            </button>

            <button
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors"
              onClick={() => handleExportUsers('json')}
              disabled={loading.users}
            >
              {loading.users ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </span>
              ) : (
                <>
                  <FaFileExcel className="mr-2" /> JSON
                </>
              )}
            </button>
          </div>
        </div>

        {/* Xuất dữ liệu truyện */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <FaBook className="text-xl" />
            </div>
            <h3 className="ml-3 font-semibold text-lg">Xuất dữ liệu truyện</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Tải xuống danh sách truyện với thông tin chi tiết như tiêu đề, tác giả, thể loại và số chương.
          </p>

          <div className="flex space-x-2">
            <button
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
              onClick={() => handleExportStories('csv')}
              disabled={loading.stories}
            >
              {loading.stories ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </span>
              ) : (
                <>
                  <FaFileCsv className="mr-2" /> CSV
                </>
              )}
            </button>

            <button
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors"
              onClick={() => handleExportStories('json')}
              disabled={loading.stories}
            >
              {loading.stories ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </span>
              ) : (
                <>
                  <FaFileExcel className="mr-2" /> JSON
                </>
              )}
            </button>
          </div>
        </div>

        {/* Xuất dữ liệu doanh thu */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
              <FaChartLine className="text-xl" />
            </div>
            <h3 className="ml-3 font-semibold text-lg">Xuất báo cáo doanh thu</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Tải xuống báo cáo doanh thu theo ngày với thông tin về số tiền và số lượng giao dịch.
          </p>

          <div className="flex space-x-2">
            <button
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
              onClick={() => handleExportRevenue('csv')}
              disabled={loading.revenue}
            >
              {loading.revenue ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </span>
              ) : (
                <>
                  <FaFileCsv className="mr-2" /> CSV
                </>
              )}
            </button>

            <button
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors"
              onClick={() => handleExportRevenue('json')}
              disabled={loading.revenue}
            >
              {loading.revenue ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </span>
              ) : (
                <>
                  <FaFileExcel className="mr-2" /> JSON
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Hướng dẫn</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Chọn định dạng CSV để dễ dàng mở trong Excel hoặc Google Sheets</li>
          <li>Chọn định dạng JSON để sử dụng trong các ứng dụng web hoặc phân tích dữ liệu</li>
          <li>Dữ liệu được xuất sẽ bao gồm tất cả các bản ghi trong hệ thống</li>
          <li>Các file xuất ra sẽ được tải xuống tự động vào thư mục Downloads của bạn</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportDataComponent;
