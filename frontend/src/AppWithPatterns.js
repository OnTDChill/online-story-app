import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các component
import RevenueExport from './components/admin/RevenueExport';
import AdvancedFilter from './components/story/AdvancedFilter';
import GenreList from './components/genre/GenreList';
import NotificationList from './components/notification/NotificationList';
import HomePage from './components/home/HomePage';
import StoryDetail from './components/story/StoryDetail';
import ChapterReader from './components/reader/ChapterReader';
import MainLayout from './components/layout/MainLayout';

// Import context providers
import { NotificationProvider } from './context/NotificationContext';

function AppWithPatterns() {
  const [token, setToken] = useState('dummy-token'); // Giả lập token

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Các trang sử dụng MainLayout */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/advanced-filter" element={<MainLayout><AdvancedFilter /></MainLayout>} />
          <Route path="/genres" element={<MainLayout><GenreList /></MainLayout>} />
          <Route path="/notifications" element={<MainLayout><NotificationList /></MainLayout>} />
          <Route path="/admin/revenue" element={<MainLayout><RevenueExport token={token} /></MainLayout>} />
          <Route path="/story/:id" element={<MainLayout><StoryDetail /></MainLayout>} />

          {/* Trang đọc truyện không sử dụng MainLayout */}
          <Route path="/story/:storyId/chapter/:chapterNumber" element={<ChapterReader />} />

          {/* Trang demo các mẫu thiết kế */}
          <Route path="/design-patterns" element={<MainLayout><DesignPatternsDemo /></MainLayout>} />
        </Routes>

        {/* Toast notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </NotificationProvider>
  );
}

// Component demo các mẫu thiết kế
function DesignPatternsDemo() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Mẫu thiết kế đã triển khai</h2>
      <p className="text-xl mb-8 text-center">Khám phá các mẫu thiết kế đã được triển khai trong ứng dụng</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold mb-3 text-blue-700">Template Method Pattern</h3>
          <p className="mb-4">Xuất dữ liệu theo nhiều định dạng khác nhau (CSV, Excel, PDF) với cấu trúc thuật toán chung.</p>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            <li>Lớp cơ sở <code className="bg-gray-100 px-1 rounded">DataExporter</code> định nghĩa khung thuật toán</li>
            <li>Các lớp con triển khai các bước cụ thể cho từng định dạng</li>
            <li>Sử dụng trong trang quản lý doanh thu</li>
          </ul>
          <Link to="/admin/revenue" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Xem demo</Link>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold mb-3 text-green-700">Observer Pattern</h3>
          <p className="mb-4">Hệ thống thông báo thời gian thực cho phép người dùng nhận thông báo khi có sự kiện mới.</p>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            <li><code className="bg-gray-100 px-1 rounded">NotificationSubject</code> quản lý và gửi thông báo</li>
            <li><code className="bg-gray-100 px-1 rounded">UserNotificationObserver</code> nhận và xử lý thông báo</li>
            <li>Sử dụng trong trang thông báo</li>
          </ul>
          <Link to="/notifications" className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Xem demo</Link>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-xl font-semibold mb-3 text-purple-700">Strategy Pattern</h3>
          <p className="mb-4">Lọc truyện nâng cao với nhiều tiêu chí khác nhau, dễ dàng mở rộng.</p>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            <li>Các chiến lược lọc khác nhau (thể loại, trạng thái, từ khóa...)</li>
            <li><code className="bg-gray-100 px-1 rounded">StoryFilterContext</code> sử dụng các chiến lược lọc</li>
            <li>Sử dụng trong trang tìm kiếm nâng cao</li>
          </ul>
          <Link to="/advanced-filter" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Xem demo</Link>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-xl font-semibold mb-3 text-orange-700">Decorator Pattern</h3>
          <p className="mb-4">Hiển thị thể loại với nhiều thông tin bổ sung như số lượng truyện và độ phổ biến.</p>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            <li><code className="bg-gray-100 px-1 rounded">BasicGenre</code> là lớp cơ bản</li>
            <li>Các decorator thêm thông tin bổ sung (số lượng, độ phổ biến)</li>
            <li>Sử dụng trong trang thể loại</li>
          </ul>
          <Link to="/genres" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">Xem demo</Link>
        </div>
      </div>
    </div>
  );
}

export default AppWithPatterns;
