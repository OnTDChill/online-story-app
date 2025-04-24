import React, { useState, useEffect, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaBook, FaChartLine, FaPlus, FaEdit, FaTrash, FaFileExport, FaSearch, FaFilter, FaListAlt, FaUndo, FaRedo, FaDownload, FaHome, FaFileArchive } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

// Import Material UI cho các component cũ
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Import các component quản trị
import AdminDashboardHome from './AdminDashboardHome';
import UsersManagement from './UsersManagement';
import StoriesManagement from './StoriesManagement';
import StoryPlotManagement from './StoryPlotManagement';
import RevenueReports from './RevenueReports';
import ExportDataComponent from './ExportDataComponent';
import CBZImporter from './CBZImporter';

/**
 * AdminDashboard - Trang quản trị cho admin
 */
// Reducer cho undo/redo
const historyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        past: [...state.past, state.present],
        present: action.payload,
        future: []
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future]
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture
      };
    default:
      return state;
  }
};

const AdminDashboard = () => {
  // State cho undo/redo
  const [tabHistory, dispatch] = useReducer(historyReducer, {
    past: [],
    present: 'home',
    future: []
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(false);
  const navigate = useNavigate();

  // Getter và setter cho activeTab
  const activeTab = tabHistory.present;
  const setActiveTab = (tab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  };

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Kiểm tra quyền admin
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.role !== 'Admin') {
          toast.error('Bạn không có quyền truy cập trang này');
          navigate('/');
          return;
        }

        setUser(response.data);
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Tạo theme cho Material UI
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0288D1',
      },
      secondary: {
        main: '#4CAF50',
      },
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
    },
  });

  // Xử lý khi thao tác thành công
  useEffect(() => {
    if (actionSuccess) {
      // Chuyển về trang chủ dashboard
      setActiveTab('home');
      setActionSuccess(false);
    }
  }, [actionSuccess]);

  // Hàm thông báo thao tác thành công và chuyển về trang chủ
  const handleActionSuccess = () => {
    setActionSuccess(true);
  };

  // Render component tương ứng với tab đang active
  const renderContent = () => {
    // Các component sử dụng Material UI cần được bọc trong ThemeProvider
    const materialUIComponents = ['users', 'stories', 'plots'];

    const content = (() => {
      switch (activeTab) {
        case 'home':
          return <AdminDashboardHome />;
        case 'users':
          return <UsersManagement onActionSuccess={handleActionSuccess} />;
        case 'stories':
          return <StoriesManagement onActionSuccess={handleActionSuccess} />;
        case 'plots':
          return <StoryPlotManagement onActionSuccess={handleActionSuccess} />;
        case 'revenue':
          return <RevenueReports onActionSuccess={handleActionSuccess} />;
        case 'export':
          return <ExportDataComponent onActionSuccess={handleActionSuccess} />;
        case 'import-cbz':
          return <CBZImporter onImportComplete={handleActionSuccess} />;
        default:
          return <AdminDashboardHome />;
      }
    })();

    // Bọc các component sử dụng Material UI trong ThemeProvider
    if (materialUIComponents.includes(activeTab)) {
      return <ThemeProvider theme={darkTheme}>{content}</ThemeProvider>;
    }

    return content;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Trang quản trị</h1>
              <p className="text-gray-600">Xin chào, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => dispatch({ type: 'UNDO' })}
                disabled={tabHistory.past.length === 0}
                className={`p-2 rounded ${tabHistory.past.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                title="Quay lại"
              >
                <FaUndo />
              </button>
              <button
                onClick={() => dispatch({ type: 'REDO' })}
                disabled={tabHistory.future.length === 0}
                className={`p-2 rounded ${tabHistory.future.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                title="Tiến tới"
              >
                <FaRedo />
              </button>
              <button
                onClick={() => setActiveTab('home')}
                className="p-2 rounded text-blue-600 hover:bg-blue-50"
                title="Trang chủ"
              >
                <FaHome />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4 lg:w-1/5">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-600 text-white">
                <h2 className="font-semibold text-lg">Menu quản trị</h2>
              </div>

              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('home')}
                      className={`w-full text-left px-4 py-2 rounded flex items-center ${
                        activeTab === 'home' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FaChartLine className="mr-3" /> Tổng quan
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`w-full text-left px-4 py-2 rounded flex items-center ${
                        activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FaUsers className="mr-3" /> Quản lý người dùng
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('stories')}
                      className={`w-full text-left px-4 py-2 rounded flex items-center ${
                        activeTab === 'stories' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FaBook className="mr-3" /> Quản lý truyện
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('plots')}
                      className={`w-full text-left px-4 py-2 rounded flex items-center ${
                        activeTab === 'plots' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FaListAlt className="mr-3" /> Quản lý cốt truyện
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('revenue')}
                      className={`w-full text-left px-4 py-2 rounded flex items-center ${
                        activeTab === 'revenue' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FaChartLine className="mr-3" /> Báo cáo doanh thu
                    </button>
                  </li>
                  <li className="pt-2 mt-2 border-t border-gray-200">
                    <button
                      onClick={() => setActiveTab('export')}
                      className={`w-full text-left px-4 py-2 rounded flex items-center ${
                        activeTab === 'export' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FaFileExport className="mr-3" /> Xuất dữ liệu
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('import-cbz')}
                      className={`w-full text-left px-4 py-2 rounded flex items-center ${
                        activeTab === 'import-cbz' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FaFileArchive className="mr-3" /> Import CBZ
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/create-story"
                      className="w-full text-left px-4 py-2 rounded flex items-center hover:bg-gray-100"
                    >
                      <FaPlus className="mr-3" /> Thêm truyện mới
                    </Link>
                  </li>
                  <li className="pt-2 mt-2 border-t border-gray-200">
                    <Link
                      to="/"
                      className="w-full text-left px-4 py-2 rounded flex items-center hover:bg-gray-100 text-green-600"
                    >
                      <FaHome className="mr-3" /> Trở về trang chủ
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4 lg:w-4/5">
            <div className="bg-white rounded-lg shadow-md p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
