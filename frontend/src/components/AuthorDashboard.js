import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';

const AuthorDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    views: 0,
    bookmarks: 0,
    notifications: 0,
    account: 0,
    activities: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [storiesResponse, notificationsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/stories', {
            headers: { Authorization: `Bearer ${token}` },
            params: { author: user.username }
          }),
          axios.get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const views = storiesResponse.data.stories.reduce((sum, story) => sum + (story.views || 0), 0);
        const bookmarks = storiesResponse.data.stories.reduce((sum, story) => sum + (story.bookmarks?.length || 0), 0);
        const notifications = notificationsResponse.data.length;

        setStats({
          views,
          bookmarks,
          notifications,
          account: 1, // Số tài khoản (có thể mở rộng)
          activities: 0 // Chưa triển khai
        });
      } catch (err) {
        setError('Lỗi khi tải dữ liệu thống kê!');
      }
    };

    if (user) fetchStats();
  }, [user]);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#1E1E1E',
        color: '#FFFFFF',
        pt: 12,
        px: 4,
        textAlign: 'center'
      }}
    >
      <Button
        variant="contained"
        component={Link}
        to="/create-story"
        sx={{
          backgroundColor: '#0288D1',
          mb: 4,
          fontSize: '1.2rem',
          px: 4,
          py: 2
        }}
      >
        Đăng truyện
      </Button>
      <Typography variant="h5" gutterBottom>
        Khu vực cho tác giả
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        {[
          { icon: <VisibilityIcon />, label: 'Đã Đọc', count: stats.views },
          { icon: <BookmarkIcon />, label: 'Bookmark', count: stats.bookmarks },
          { icon: <NotificationsIcon />, label: 'Hệ Thống', count: stats.notifications },
          { icon: <AccountCircleIcon />, label: 'Tài Khoản', count: stats.account },
          { icon: <EventIcon />, label: 'Hoạt Động', count: stats.activities }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.label}>
            <Box
              sx={{
                backgroundColor: '#424242',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 100
              }}
            >
              <Box sx={{ mr: 2 }}>{item.icon}</Box>
              <Box>
                <Typography variant="h6">{item.label}</Typography>
                <Typography>{item.count}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AuthorDashboard;