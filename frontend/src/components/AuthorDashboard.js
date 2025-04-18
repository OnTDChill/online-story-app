import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';

const AuthorDashboard = () => {
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
      <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        {[
          { icon: <VisibilityIcon />, label: 'Đã Đọc', count: 0 },
          { icon: <BookmarkIcon />, label: 'Bookmark', count: 0 },
          { icon: <NotificationsIcon />, label: 'Hệ Thống', count: 0 },
          { icon: <AccountCircleIcon />, label: 'Tài Khoản', count: 0 },
          { icon: <EventIcon />, label: 'Hoạt Động', count: 0 }
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