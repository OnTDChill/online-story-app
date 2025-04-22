import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Button, Container, Divider, Paper } from '@mui/material';
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
        console.log('Fetching story with ID:', id);
        const response = await axios.get(`http://localhost:5000/api/stories/${id}`);
        console.log('Story data:', response.data);
        setStory(response.data);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Lỗi khi tải truyện!');
      }
    };

    const fetchChapters = async () => {
      try {
        console.log('Fetching chapters for story ID:', id);

        // Nếu là truyện Naruto, tạo dữ liệu mẫu
        if (id === '6807722cf2d1107e375d6e9d') {
          console.log('Using mock data for Naruto');
          const mockChapters = [];
          for (let i = 1; i <= 10; i++) {
            mockChapters.push({
              _id: `mock-chapter-${i}`,
              chapter_number: i,
              title: `Chương ${i}`,
              content: `Nội dung chương ${i} của truyện Naruto`
            });
          }
          setChapters(mockChapters);
          return;
        }

        // Nếu không phải Naruto, lấy dữ liệu từ API
        const response = await axios.get(`http://localhost:5000/api/stories/${id}/chapters`);
        console.log('Chapters data:', response.data);
        console.log('Chapters data type:', typeof response.data);
        console.log('Is array:', Array.isArray(response.data));
        if (Array.isArray(response.data)) {
          console.log('Chapters length:', response.data.length);
          if (response.data.length > 0) {
            console.log('First chapter:', response.data[0]);
          }
        }
        setChapters(response.data);
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError('Lỗi khi tải danh sách chương!');
      }
    };

    fetchStory();
    fetchChapters();
  }, [id]);

  const handleChapterClick = async (chapter) => {
    try {
      console.log('Handling chapter click:', chapter._id);

      // Nếu là dữ liệu mẫu (mock data), sử dụng trực tiếp
      if (chapter._id.startsWith('mock-chapter')) {
        console.log('Using mock chapter data');
        // Gọi API để lấy nội dung chương thật từ database
        try {
          const response = await axios.get(`http://localhost:5000/api/stories/${id}/chapters`);
          if (Array.isArray(response.data) && response.data.length > 0) {
            // Tìm chương tương ứng trong database
            const realChapter = response.data.find(c => c.chapter_number === chapter.chapter_number);
            if (realChapter) {
              console.log('Found real chapter data:', realChapter.title);
              setSelectedChapter(realChapter);
              return;
            }
          }
        } catch (err) {
          console.log('Could not fetch real chapter data, using mock data instead');
        }

        // Nếu không tìm thấy dữ liệu thật, sử dụng dữ liệu mẫu
        const mockChapterData = {
          _id: chapter._id,
          chapter_number: chapter.chapter_number,
          title: chapter.title,
          content: `<p>${chapter.content}</p><p>Đây là nội dung mẫu cho chương ${chapter.chapter_number} của truyện Naruto.</p><p>Bạn có thể thêm nội dung chi tiết ở đây.</p>`,
          images: [] // Không có hình ảnh
        };
        setSelectedChapter(mockChapterData);
      } else {
        // Nếu không phải dữ liệu mẫu, gọi API
        const response = await axios.get(`http://localhost:5000/api/chapters/${chapter._id}`);
        console.log('Chapter data from API:', response.data);
        setSelectedChapter(response.data);
      }

      // Chỉ cập nhật tiến trình nếu người dùng đã đăng nhập
      if (user) {
        try {
          await axios.post('http://localhost:5000/api/progress', {
            userId: user._id,
            storyId: id,
            chapterId: chapter.chapter_number
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (progressErr) {
          console.error('Error updating progress:', progressErr);
        }
      }
    } catch (err) {
      console.error('Error handling chapter:', err);
      setError('Lỗi khi tải nội dung chương!');
    }
  };

  if (error) return <Typography color="error" sx={{ mt: 16, ml: 4 }}>{error}</Typography>;
  if (!story) return <Typography sx={{ mt: 16, ml: 4 }}>Đang tải...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
      <Paper sx={{ p: 3, backgroundColor: '#fff' }}>
        {/* Tiêu đề truyện */}
        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
          {story.title}
        </Typography>

        {/* Thông tin tác giả và thể loại */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body1">Tác giả: {story.author}</Typography>
          <Typography variant="body1">Thể loại: {story.genre}</Typography>
        </Box>

        {/* Mô tả truyện */}
        <Typography variant="body1" sx={{ mb: 2 }}>
          {story.description}
        </Typography>

        {/* Hình ảnh truyện */}
        {story.thumbnail && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={story.thumbnail && story.thumbnail.startsWith('http') ? story.thumbnail : `http://localhost:5000/uploads/thumbnails/${story.thumbnail}`}
              alt={story.title}
              sx={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          </Box>
        )}

        {/* Danh sách chương */}
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Danh sách chương
        </Typography>



        <List sx={{ backgroundColor: '#f5f5f5', borderRadius: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {Array.isArray(chapters) && chapters.length > 0 ? (
            chapters.map((chapter) => (
                <ListItem
                  button
                  key={chapter._id}
                  onClick={() => handleChapterClick(chapter)}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    padding: '12px 16px',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#FF6B00' }}>
                        Chương {chapter.chapter_number}: {chapter.title}
                      </Typography>
                    }
                  />
                </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Không có chương nào được tìm thấy" />
            </ListItem>
          )}
        </List>

        {/* Nội dung chương */}
        {selectedChapter && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 3px 5px rgba(0,0,0,0.1)' }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 2,
                color: '#FF6B00',
                textAlign: 'center',
                fontSize: '1.8rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                padding: '10px 0'
              }}>
                Chương {selectedChapter.chapter_number}: {selectedChapter.title}
              </Typography>

              <Divider sx={{ mb: 3, borderColor: '#FFB74D' }} />

              <Box sx={{ mb: 3 }}>
                <div
                  dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
                  style={{
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    color: '#333',
                    textAlign: 'justify'
                  }}
                />
              </Box>

              {selectedChapter.images && selectedChapter.images.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  {selectedChapter.images.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={`http://localhost:5000/uploads/chapterImages/${image}`}
                      alt={`Chapter image ${index + 1}`}
                      sx={{ maxWidth: '100%', mt: 2, borderRadius: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    />
                  ))}
                </Box>
              )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => setSelectedChapter(null)}
                sx={{
                  backgroundColor: '#FF6B00',
                  '&:hover': { backgroundColor: '#E65100' },
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Quay lại danh sách
              </Button>

              {/* Nút chuyển chương */}
              <Box>
                <Button
                  variant="outlined"
                  sx={{
                    mr: 1,
                    borderColor: '#FF6B00',
                    color: '#FF6B00',
                    '&:hover': { borderColor: '#E65100', backgroundColor: '#FFF3E0' }
                  }}
                  disabled={selectedChapter.chapter_number <= 1}
                  onClick={() => {
                    const prevChapter = chapters.find(c => c.chapter_number === selectedChapter.chapter_number - 1);
                    if (prevChapter) handleChapterClick(prevChapter);
                  }}
                >
                  Chương trước
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#FF6B00',
                    color: '#FF6B00',
                    '&:hover': { borderColor: '#E65100', backgroundColor: '#FFF3E0' }
                  }}
                  disabled={selectedChapter.chapter_number >= chapters.length}
                  onClick={() => {
                    const nextChapter = chapters.find(c => c.chapter_number === selectedChapter.chapter_number + 1);
                    if (nextChapter) handleChapterClick(nextChapter);
                  }}
                >
                  Chương sau
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default StoryDetail;