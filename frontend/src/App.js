import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import StoryList from './components/StoryList';
import CreateStory from './components/CreateStory';
import StoryDetail from './components/StoryDetail';
import AuthorDashboard from './components/AuthorDashboard';
import Profile from './components/Profile';
import Genres from './components/Genres';
import AdminDashboard from './components/AdminDashboard';
import TestForm from './components/TestForm';
import HomePage from './components/home/HomePage';
import MangaDetail from './components/manga/MangaDetail';
import MangaReader from './components/manga/MangaReader';
import MangaList from './components/manga/MangaList';

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

  const StoryListWrapper = () => {
    const location = useLocation();
    const { mode, showAdvancedSearch } = location.state || {};
    console.log('StoryListWrapper state:', { mode, showAdvancedSearch });
    return <StoryList user={user} initialMode={mode} initialShowAdvancedSearch={showAdvancedSearch} />;
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={<HomePage />} />
          <Route
            path="/create-story"
            element={
              user && user.role === 'Admin' ? <CreateStory /> : <Navigate to="/login" />
            }
          />
          <Route path="/story/:id" element={<StoryDetail user={user} />} />
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          <Route path="/stories" element={<StoryListWrapper />} />
          <Route path="/admin" element={user && user.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/test-form" element={<TestForm />} />
          <Route path="/grid" element={<HomePage />} />
          <Route path="/manga" element={<MangaList />} />
          <Route path="/manga/:mangaId" element={<MangaDetail />} />
          <Route path="/manga/:mangaId/chapter/:chapterNumber" element={<MangaReader />} />
          <Route path="/doraemon" element={<MangaDetail mangaId="doraemon" />} />
          <Route path="/one-piece" element={<MangaDetail mangaId="one-piece" />} />
          <Route path="/naruto" element={<MangaDetail mangaId="naruto" />} />
          <Route path="/cua-thu" element={<MangaDetail mangaId="cưa_thủ" />} />
          <Route path="/cua-thu/chapter/:chapterNumber" element={<MangaReader mangaId="cưa_thủ" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;