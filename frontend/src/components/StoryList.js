import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const StoryList = ({ user }) => {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const search = searchParams.get('search') || '';
        const response = await axios.get(`http://localhost:5000/api/stories?search=${search}`);
        setStories(response.data);
      } catch (err) {
        setError('Lỗi khi tải danh sách truyện!');
      }
    };
    fetchStories();
  }, [location.search]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 15, p: 2 }}>
      <Typography variant="h4" gutterBottom>Danh Sách Truyện</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {user && user.role === 'Admin' && (
        <Button
          variant="contained"
          component={Link}
          to="/create-story"
          sx={{ mb: 2 }}
        >
          Tạo Truyện Mới
        </Button>
      )}
      <List>
        {stories.map((story) => (
          <ListItem
            key={story._id}
            component={Link}
            to={`/story/${story._id}`}
            sx={{ textDecoration: 'none' }}
          >
            <ListItemText
              primary={story.title}
              secondary={`Tác giả: ${story.author} | Thể loại: ${story.genre}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default StoryList;