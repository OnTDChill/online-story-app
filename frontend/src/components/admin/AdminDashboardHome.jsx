import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaChartLine, FaEye, FaHeart, FaComment, FaFileAlt, FaUserEdit, FaBookOpen } from 'react-icons/fa';

/**
 * AdminDashboardHome - Trang tổng quan cho admin dashboard
 */
const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStories: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentUsers: [],
    recentStories: [],
    popularStories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
    // Ở đây chúng ta sẽ sử dụng dữ liệu mẫu
    const fetchData = async () => {
      setLoading(true);
      try {
        // Giả lập gọi API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Dữ liệu mẫu
        setStats({
          totalUsers: 1250,
          totalStories: 345,
          totalViews: 1250000,
          totalLikes: 45600,
          totalComments: 12300,
          recentUsers: [
            { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', createdAt: '2023-05-10T08:30:00Z' },
            { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', createdAt: '2023-05-09T14:20:00Z' },
            { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', createdAt: '2023-05-08T10:15:00Z' },
            { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', createdAt: '2023-05-07T16:45:00Z' },
            { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', createdAt: '2023-05-06T09:10:00Z' }
          ],
          recentStories: [
            { id: 1, title: 'One Piece', author: 'Eiichiro Oda', createdAt: '2023-05-10T07:30:00Z', status: 'ongoing' },
            { id: 2, title: 'Naruto', author: 'Masashi Kishimoto', createdAt: '2023-05-09T11:20:00Z', status: 'completed' },
            { id: 3, title: 'Dragon Ball', author: 'Akira Toriyama', createdAt: '2023-05-08T09:15:00Z', status: 'completed' },
            { id: 4, title: 'Bleach', author: 'Tite Kubo', createdAt: '2023-05-07T14:45:00Z', status: 'completed' },
            { id: 5, title: 'Attack on Titan', author: 'Hajime Isayama', createdAt: '2023-05-06T08:10:00Z', status: 'completed' }
          ],
          popularStories: [
            { id: 1, title: 'One Piece', views: 125000, likes: 8500, comments: 1200 },
            { id: 2, title: 'Naruto', views: 98000, likes: 7200, comments: 950 },
            { id: 3, title: 'Dragon Ball', views: 85000, likes: 6300, comments: 820 },
            { id: 4, title: 'Bleach', views: 72000, likes: 5100, comments: 680 },
            { id: 5, title: 'Attack on Titan', views: 68000, likes: 4800, comments: 620 }
          ]
        });
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tổng quan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format số lượng
  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    } else {
      return number;
    }
  };

  // Format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <FaUsers className="text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Tổng người dùng</h3>
              <p className="text-2xl font-semibold">{formatNumber(stats.totalUsers)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 text-white p-3 rounded-full">
              <FaBook className="text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Tổng truyện</h3>
              <p className="text-2xl font-semibold">{formatNumber(stats.totalStories)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <FaEye className="text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Tổng lượt xem</h3>
              <p className="text-2xl font-semibold">{formatNumber(stats.totalViews)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <h3 className="text-xl font-semibold mb-4">Tính năng quản trị</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <FaUserEdit className="text-xl" />
            </div>
            <h3 className="ml-3 font-semibold text-lg">Quản lý người dùng</h3>
          </div>
          <p className="text-gray-600 mb-4">Thêm, sửa, xóa và quản lý tài khoản người dùng trong hệ thống.</p>
          <button className="text-blue-600 hover:text-blue-800 font-medium">Xem chi tiết →</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <FaBookOpen className="text-xl" />
            </div>
            <h3 className="ml-3 font-semibold text-lg">Quản lý truyện</h3>
          </div>
          <p className="text-gray-600 mb-4">Thêm, sửa, xóa và quản lý các truyện và chương truyện.</p>
          <button className="text-green-600 hover:text-green-800 font-medium">Xem chi tiết →</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
              <FaFileAlt className="text-xl" />
            </div>
            <h3 className="ml-3 font-semibold text-lg">Quản lý cốt truyện</h3>
          </div>
          <p className="text-gray-600 mb-4">Tạo và quản lý cốt truyện, các tình huống và nhân vật.</p>
          <button className="text-purple-600 hover:text-purple-800 font-medium">Xem chi tiết →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Người dùng mới</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentUsers.map(user => (
                  <tr key={user.id}>
                    <td className="py-3 px-3 whitespace-nowrap">{user.name}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-500">{formatTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Stories */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Truyện mới thêm</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thêm</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentStories.map(story => (
                  <tr key={story.id}>
                    <td className="py-3 px-3 whitespace-nowrap">{story.title}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-500">{story.author}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-500">{formatTime(story.createdAt)}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        story.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {story.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Stories */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Truyện phổ biến</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaEye className="mr-1" /> Lượt xem
                    </div>
                  </th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaHeart className="mr-1" /> Lượt thích
                    </div>
                  </th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaComment className="mr-1" /> Bình luận
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.popularStories.map(story => (
                  <tr key={story.id}>
                    <td className="py-3 px-3 whitespace-nowrap">{story.title}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-500">{formatNumber(story.views)}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-500">{formatNumber(story.likes)}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-500">{formatNumber(story.comments)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
