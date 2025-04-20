import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';

const StoryDetail = ({ user }) => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
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
      const response = await axios.get(`http://localhost:5000/api/chapters/${chapter._id}`);
      setSelectedChapter(response.data);
      await axios.post('http://localhost:5000/api/progress', {
        userId: user._id,
        storyId: id,
        chapterId: chapter.chapter_number
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      setError('Lỗi khi tải nội dung chương hoặc cập nhật tiến trình!');
    }
  };

  if (error) return <Typography color="error" sx={{ mt: 16, ml: 4 }}>{error}</Typography>;
  if (!story) return <Typography sx={{ mt: 16, ml: 4 }}>Đang tải...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 16, p: 2 }}>
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
      {selectedChapter && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">{selectedChapter.title}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>{selectedChapter.content}</Typography>
          {selectedChapter.images && selectedChapter.images.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {selectedChapter.images.map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={`http://localhost:5000/uploads/chapterImages/${image}`}
                  alt={`Chapter image ${index + 1}`}
                  sx={{ maxWidth: '100%', mt: 1 }}
                />
              ))}
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => setSelectedChapter(null)}
            sx={{ mt: 2, backgroundColor: '#0288D1' }}
          >
            Đóng nội dung
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default StoryDetail;