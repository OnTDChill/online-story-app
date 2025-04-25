import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Import các component mới
import MainLayout from './components/layout/MainLayout';
import HomePage from './components/home/HomePage';
import StoryDetail from './components/story/StoryDetail';
import DoraemonDetail from './components/story/DoraemonDetail';
import ChapterReader from './components/reader/ChapterReader';
import CBZStoryViewer from './components/reader/CBZStoryViewer';
import SimplePDFViewer from './components/reader/SimplePDFViewer';
import AdvancedFilter from './components/story/AdvancedFilter';
import GenreList from './components/genre/GenreList';
import NotificationList from './components/notification/NotificationList';
import RevenueExport from './components/admin/RevenueExport';
import DoraemonPDFReader from './components/reader/DoraemonPDFReader';
import Rankings from './components/rankings/Rankings';
import NewStories from './components/story/NewStories';
import CompletedStories from './components/story/CompletedStories';
import AdminDashboard from './components/admin/AdminDashboard';

// Import các component cũ
import Login from './components/Login';
import Register from './components/Register';
import CreateStory from './components/CreateStory';
import AuthorDashboard from './components/AuthorDashboard';
import Profile from './components/Profile';
// import AdminDashboard from './components/AdminDashboard'; // Đã import ở trên

// Import context providers
import { NotificationProvider } from './context/NotificationContext';

function AppNew() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => setUser(response.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Các trang sử dụng MainLayout */}
          <Route path="/" element={<MainLayout setUser={setUser}><HomePage /></MainLayout>} />
          <Route path="/advanced-filter" element={<MainLayout setUser={setUser}><AdvancedFilter /></MainLayout>} />
          <Route path="/genres" element={<MainLayout setUser={setUser}><GenreList /></MainLayout>} />
          <Route path="/notifications" element={<MainLayout setUser={setUser}><NotificationList /></MainLayout>} />
          {/* Đã chuyển báo cáo doanh thu vào dashboard admin */}
          <Route path="/story/:id" element={<MainLayout setUser={setUser}><StoryDetail /></MainLayout>} />

          {/* Các trang mới thêm */}
          <Route path="/rankings" element={<MainLayout setUser={setUser}><Rankings /></MainLayout>} />
          <Route path="/new-stories" element={<MainLayout setUser={setUser}><NewStories /></MainLayout>} />
          <Route path="/completed-stories" element={<MainLayout setUser={setUser}><CompletedStories /></MainLayout>} />
          <Route path="/doraemon" element={<MainLayout setUser={setUser}><DoraemonDetail /></MainLayout>} />
          <Route path="/doraemon/chapter/:chapterNumber" element={<DoraemonPDFReader />} />

          {/* Trang đọc truyện không sử dụng MainLayout */}
          <Route path="/story/:storyId/chapter/:chapterNumber" element={<ChapterReader />} />
          <Route path="/cbz-story/:storyId" element={<CBZStoryViewer />} />
          <Route path="/pdf-reader" element={<SimplePDFViewer />} />

          {/* Các trang đăng nhập/đăng ký */}
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

          {/* Các trang quản lý */}
          <Route
            path="/create-story"
            element={
              user && user.role === 'Admin' ? <CreateStory /> : <Navigate to="/login" />
            }
          />
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        {/* Toast notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </NotificationProvider>
  );
}

export default AppNew;
