import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const StoryDetail = ({ user }) => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/stories/${id}`);
        setStory(response.data);
      } catch (err) {
        setError('Lỗi khi tải truyện!');
      }
    };

    const fetchChapters = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/stories/${id}/chapters`);
        setChapters(response.data);
      } catch (err) {
        setError('Lỗi khi tải danh sách chương!');
      }
    };

    fetchStory();
    fetchChapters();
  }, [id]);

  const handleChapterClick = async (chapter) => {
    if (!user) return;
    try {
      await axios.post('http://localhost:5000/api/progress', {
        userId: user._id,
        storyId: id,
        chapterId: chapter.chapter_number
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật tiến trình:', err);
    }
  };

  if (error) return <Typography color="error">{error}</Typography>;
  if (!story) return <Typography>Đang tải...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4">{story.title}</Typography>
      <Typography variant="subtitle1">Tác giả: {story.author}</Typography>
      <Typography variant="subtitle1">Thể loại: {story.genre}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>{story.description}</Typography>
      {story.thumbnail && (
        <Box
          component="img"
          src={`http://localhost:5000/uploads/thumbnails/${story.thumbnail}`}
          alt={story.title}
          sx={{ maxWidth: '100%', mt: 2 }}
        />
      )}
      <Typography variant="h5" sx={{ mt: 4 }}>Danh sách chương</Typography>
      <List>
        {chapters.map((chapter) => (
          <ListItem
            button
            key={chapter._id}
            onClick={() => handleChapterClick(chapter)}
          >
            <ListItemText primary={chapter.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default StoryDetail;