import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import axios from 'axios';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import StoryList from './components/StoryList';
import CreateStory from './components/CreateStory';
import StoryDetail from './components/StoryDetail';
import AuthorDashboard from './components/AuthorDashboard';
import Profile from './components/Profile';

const theme = createTheme({
  palette: {
    primary: { main: '#0288D1' },
    secondary: { main: '#B0BEC5' },
    background: { default: '#1E1E1E', paper: '#424242' },
    text: { primary: '#FFFFFF', secondary: '#B0BEC5' }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  }
});

function App() {
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
    <ThemeProvider theme={theme}>
      <Router>
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={<StoryList user={user} />} />
          <Route
            path="/create-story"
            element={
              user && user.role === 'Admin' ? <CreateStory /> : <Navigate to="/login" />
            }
          />
          <Route path="/story/:id" element={<StoryDetail user={user} />} />
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/manage-stories" element={<Typography sx={{ mt: 12, ml: 4 }}>Quản Lý Truyện (chưa triển khai)</Typography>} />
          <Route path="/top-up" element={<Typography sx={{ mt: 12, ml: 4 }}>Nạp Xèng (chưa triển khai)</Typography>} />
          <Route path="/messages" element={<Typography sx={{ mt: 12, ml: 4 }}>Tin Nhắn (chưa triển khai)</Typography>} />
          <Route path="/genres" element={<Typography sx={{ mt: 12, ml: 4 }}>Danh sách thể loại (chưa triển khai)</Typography>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;