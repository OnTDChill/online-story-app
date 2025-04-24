import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaBell, FaBookmark, FaSignOutAlt, FaBars, FaTimes, FaCog, FaFire, FaPercent, FaApple, FaAndroid } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from 'react-toastify';

/**
 * MainLayout - Layout chính cho toàn bộ ứng dụng
 */
const MainLayout = ({ children, setUser }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  // Kiểm tra xem người dùng có phải là admin không
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userMenuRef = useRef(null);

  // Xử lý click bên ngoài để đóng menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Kiểm tra trạng thái đăng nhập và quyền admin
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      console.log('Checking login status:', { token, userRole });

      setIsLoggedIn(!!token);
      setIsAdmin(userRole === 'admin' || userRole === 'Admin');
    };

    // Kiểm tra khi component mount
    checkLoginStatus();

    // Thêm event listener để kiểm tra khi localStorage thay đổi
    window.addEventListener('storage', checkLoginStatus);

    // Tạo một custom event để cập nhật trạng thái đăng nhập
    const handleLoginStatusChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('loginStatusChange', handleLoginStatusChange);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChange', handleLoginStatusChange);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    // Xóa token và thông tin người dùng
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    // Đóng menu
    setShowUserMenu(false);

    // Thông báo đăng xuất thành công
    toast.success('Đăng xuất thành công');

    // Cập nhật trạng thái
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    // Cập nhật trạng thái user trong AppNew.js
    if (setUser) {
      setUser(null);
    }

    // Kích hoạt sự kiện để cập nhật trạng thái đăng nhập
    window.dispatchEvent(new Event('loginStatusChange'));
    
    // Chuyển hướng về trang chủ
    window.location.href = '/';
  };

  // Xử lý chuyển đến trang cài đặt
  const handleSettings = () => {
    navigate('/settings');
    setShowUserMenu(false);
    toast.info('Đang chuyển đến trang cài đặt');
  };

  // Danh sách menu
  const menuItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/genres', label: 'Thể loại' },
    { path: '/advanced-filter', label: 'Tìm kiếm nâng cao' },
    { path: '/rankings', label: 'Bảng xếp hạng' },
    { path: '/new-stories', label: 'Truyện mới' },
    { path: '/completed-stories', label: 'Truyện hoàn thành' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4">
          {/* Top Header */}
          <div className="flex justify-between items-center py-3 border-b border-blue-500">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold flex items-center">
              <img src="/logo.svg" alt="Logo" className="h-8 mr-2" />
              <span>TruyệnHD</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm truyện, tác giả..."
                  className="w-full py-2 pl-4 pr-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600">
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Link to="/notifications" className="relative">
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Bookmarks */}
              <Link to="/bookmarks">
                <FaBookmark className="text-xl" />
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center space-x-1"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <FaUser className="text-xl" />
                  <span className="hidden md:inline">Tài khoản</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Hồ sơ
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                        onClick={handleSettings}
                      >
                        <FaCog className="inline mr-2" />
                        Cài đặt
                      </button>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUser className="inline mr-2" />
                          Quản trị
                        </Link>
                      )}
                      <div className="border-t border-gray-200"></div>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="inline mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-xl"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* Bottom Header - Navigation */}
          <nav className="hidden md:block py-2">
            <ul className="flex space-x-6">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`hover:text-blue-200 ${
                      location.pathname === item.path ? 'font-bold' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobile Search and Menu */}
        <div className={`md:hidden ${showMobileMenu ? 'block' : 'hidden'}`}>
          <div className="p-4 border-t border-blue-500">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm truyện, tác giả..."
                className="w-full py-2 pl-4 pr-10 rounded-full text-gray-800 focus:outline-none"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaSearch />
              </button>
            </div>

            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`block py-2 ${
                      location.pathname === item.path ? 'font-bold' : ''
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebars */}
      <div className="flex-1 container mx-auto px-4 py-6 flex">
        {/* Left Sidebar - Hot Stories */}
        <aside className="hidden lg:block w-72 mr-6 sticky top-4">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-md p-4 mb-6 text-white">
            <h3 className="font-semibold text-xl mb-3 flex items-center">
              <FaFire className="mr-2" /> Truyện Hot
            </h3>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-red-300">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-start space-x-3 pb-3 border-b border-white border-opacity-20">
                    <img
                      src={`https://picsum.photos/200/300?random=${item}`}
                      alt="Manga cover"
                      className="w-16 h-20 object-cover rounded-md shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-sm">Truyện hot #{item}</h4>
                      <p className="text-xs text-white text-opacity-80 mt-1">Thể loại: Hành động, Phiêu lưu</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full">HOT</span>
                        <span className="text-xs ml-2">⭐ 4.9</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-2">
              <Link to="/hot-stories" className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-4 rounded-full transition duration-300">
                Xem thêm
              </Link>
            </div>
          </div>

          {/* Quảng cáo bên trái */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Quảng cáo</h3>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="https://picsum.photos/400/600?random=99"
                alt="Advertisement"
                className="w-full h-auto rounded-lg hover:opacity-90 transition duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h4 className="text-white font-bold text-lg">Tải game ngay!</h4>
                <p className="text-white text-sm">Trải nghiệm game mới nhất</p>
                <button className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded-full text-sm transition duration-300">
                  Tải xuống
                </button>
              </div>
            </div>
          </div>

          {/* Quảng cáo bên trái (thứ hai) */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Sự kiện đặc biệt</h3>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="https://picsum.photos/400/200?random=101"
                alt="Special Event"
                className="w-full h-auto rounded-lg hover:opacity-90 transition duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h4 className="text-white font-bold text-lg">Sự kiện mùa hè</h4>
                <p className="text-white text-sm">Tham gia ngay để nhận quà</p>
                <button className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300">
                  Tham gia
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Thể loại phổ biến</h3>
            <ul className="space-y-2">
              <li><Link to="/genres/action" className="text-blue-600 hover:underline">Hành động</Link></li>
              <li><Link to="/genres/romance" className="text-blue-600 hover:underline">Tình cảm</Link></li>
              <li><Link to="/genres/fantasy" className="text-blue-600 hover:underline">Phiêu lưu</Link></li>
              <li><Link to="/genres/horror" className="text-blue-600 hover:underline">Kinh dị</Link></li>
              <li><Link to="/genres/comedy" className="text-blue-600 hover:underline">Hài hước</Link></li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Right Sidebar - Promotions */}
        <aside className="hidden lg:block w-72 ml-6 sticky top-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md p-4 mb-6 text-white">
            <h3 className="font-semibold text-xl mb-3 flex items-center">
              <FaPercent className="mr-2" /> Khuyến mãi
            </h3>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-300">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="bg-white bg-opacity-20 rounded-lg p-3 shadow-md">
                    <h4 className="font-bold text-sm mb-2">Giảm {item * 10}% nạp kim cương</h4>
                    <p className="text-xs">Áp dụng đến ngày {new Date().getDate() + item}/6/2023</p>
                    <button className="mt-2 bg-white text-purple-600 text-xs font-bold py-1 px-3 rounded-full">
                      Nhận ngay
                    </button>
                  </div>
                ))}

                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-3 shadow-md">
                  <h4 className="font-bold text-sm mb-2">VIP MEMBER</h4>
                  <p className="text-xs">Đăng ký VIP để đọc tất cả truyện không giới hạn</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="line-through text-xs">99.000đ</span>
                    <span className="font-bold">49.000đ</span>
                  </div>
                  <button className="mt-2 w-full bg-white text-yellow-600 text-xs font-bold py-1 px-3 rounded-full">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <Link to="/promotions" className="inline-block bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-4 rounded-full transition duration-300">
                Xem thêm
              </Link>
            </div>
          </div>

          {/* Quảng cáo bên phải */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Quảng cáo</h3>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="https://picsum.photos/400/600?random=100"
                alt="Advertisement"
                className="w-full h-auto rounded-lg hover:opacity-90 transition duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h4 className="text-white font-bold text-lg">Manga mới nhất</h4>
                <p className="text-white text-sm">Đọc ngay bộ truyện mới nhất</p>
                <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300">
                  Đọc ngay
                </button>
              </div>
            </div>
          </div>

          {/* Quảng cáo bên phải (thứ hai) */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Ứng dụng di động</h3>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="https://picsum.photos/400/200?random=102"
                alt="Mobile App"
                className="w-full h-auto rounded-lg hover:opacity-90 transition duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h4 className="text-white font-bold text-lg">Tải ứng dụng</h4>
                <p className="text-white text-sm">Đọc truyện mọi lúc mọi nơi</p>
                <div className="flex space-x-2 mt-2">
                  <button className="bg-black hover:bg-gray-800 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 flex items-center">
                    <FaApple className="mr-1" /> iOS
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 flex items-center">
                    <FaAndroid className="mr-1" /> Android
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Truyện đang đọc</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <img src="https://via.placeholder.com/50" alt="Thumbnail" className="w-12 h-16 object-cover rounded mr-3" />
                <div>
                  <h4 className="font-medium text-sm">Tên truyện dài nhiều chữ</h4>
                  <p className="text-xs text-gray-500">Đọc tiếp chương 10</p>
                </div>
              </li>
              <li className="flex items-center">
                <img src="https://via.placeholder.com/50" alt="Thumbnail" className="w-12 h-16 object-cover rounded mr-3" />
                <div>
                  <h4 className="font-medium text-sm">Tên truyện khác</h4>
                  <p className="text-xs text-gray-500">Đọc tiếp chương 5</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">TruyệnHD</h3>
              <p className="text-gray-400 mb-4">
                Website đọc truyện online với nhiều thể loại truyện đa dạng, cập nhật liên tục.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Thể loại</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/genres/action" className="hover:text-white">Hành động</Link></li>
                <li><Link to="/genres/romance" className="hover:text-white">Tình cảm</Link></li>
                <li><Link to="/genres/fantasy" className="hover:text-white">Phiêu lưu</Link></li>
                <li><Link to="/genres/horror" className="hover:text-white">Kinh dị</Link></li>
                <li><Link to="/genres/comedy" className="hover:text-white">Hài hước</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">Giới thiệu</Link></li>
                <li><Link to="/terms" className="hover:text-white">Điều khoản sử dụng</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Chính sách bảo mật</Link></li>
                <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@truyenhd.com</li>
                <li>Điện thoại: 0123 456 789</li>
                <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2023 TruyệnHD. Tất cả quyền được bảo lưu.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4 text-gray-400">
                <li><Link to="/terms" className="hover:text-white">Điều khoản</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Bảo mật</Link></li>
                <li><Link to="/cookies" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
