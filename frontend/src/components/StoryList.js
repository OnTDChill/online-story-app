import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, Pagination, Select, MenuItem, FormControl, InputLabel, TextField, Collapse, Snackbar, Alert } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NormalListState from '../states/NormalListState';
import RankingListState from '../states/RankingListState';
import OriginalListState from '../states/OriginalListState';
import TranslatedListState from '../states/TranslatedListState';

const StoryList = ({ user, initialMode, initialShowAdvancedSearch }) => {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState('Tất cả');
  const [sort, setSort] = useState('latest');
  const [state, setState] = useState(null);
  const [mode, setMode] = useState(initialMode || 'normal');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(initialShowAdvancedSearch || false);
  const [searchParams, setSearchParams] = useState({ search: '', author: '', status: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const location = useLocation();
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    switch (mode) {
      case 'ranking': setState(new RankingListState({ axios })); break;
      case 'original': setState(new OriginalListState({ axios })); break;
      case 'translated': setState(new TranslatedListState({ axios })); break;
      default: setState(new NormalListState({ axios }));
    }
  }, [mode]);

  useEffect(() => {
    const fetchStories = async () => {
      if (!state) return;
      try {
        const searchParamsFromUrl = new URLSearchParams(location.search);
        const search = searchParamsFromUrl.get('search') || searchParams.search;
        const genreFromUrl = searchParamsFromUrl.get('genre') || genre;
        const params = {
          search,
          genre: genreFromUrl !== 'Tất cả' ? genreFromUrl : '',
          author: searchParams.author,
          status: searchParams.status,
          sort,
          page,
          limit,
        };
        const response = await state.fetchStories(params);
        const fetchedStories = Array.isArray(response.stories) ? response.stories : [];
        setStories(fetchedStories);
        setTotalPages(Math.ceil(response.total / limit));
      } catch (err) {
        const message = err.response?.data?.message || 'Lỗi khi tải danh sách truyện!';
        setError(message);
        setSnackbar({ open: true, message, severity: 'error' });
        setStories([]);
      }
    };
    fetchStories();
  }, [location.search, genre, sort, page, state, searchParams]);

  const handlePageChange = (event, value) => setPage(value);

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleBookmark = async (storyId) => {
    try {
      await axios.post('http://localhost:5000/api/user/bookmark', { storyId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: 'Đã thêm vào Bookmark!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi bookmark truyện!', severity: 'error' });
    }
  };

  const handleAdvancedSearch = (e) => {
    e.preventDefault();
    setPage(1);
    navigate(`/?search=${searchParams.search}`);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 10, p: 2, backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>
        {state?.getTitle() || 'Danh Sách Truyện'}
      </Typography>
      <Collapse in={showAdvancedSearch}>
        <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 3, p: 2, backgroundColor: '#424242', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Tiêu đề"
              value={searchParams.search}
              onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
              sx={{ backgroundColor: '#1E1E1E', input: { color: '#FFFFFF' }, label: { color: '#B0BEC5' } }}
            />
            <TextField
              label="Tác giả"
              value={searchParams.author}
              onChange={(e) => setSearchParams({ ...searchParams, author: e.target.value })}
              sx={{ backgroundColor: '#1E1E1E', input: { color: '#FFFFFF' }, label: { color: '#B0BEC5' } }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: '#B0BEC5' }}>Trạng thái</InputLabel>
              <Select
                value={searchParams.status}
                onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                sx={{ color: '#FFFFFF', backgroundColor: '#1E1E1E' }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Hành động">Hành động</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#0288D1' }}>
              Tìm kiếm
            </Button>
          </Box>
        </Box>
      </Collapse>
      {mode === 'normal' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#B0BEC5' }}>Thể loại</InputLabel>
            <Select value={genre} onChange={handleGenreChange} sx={{ color: '#FFFFFF', backgroundColor: '#424242' }}>
              <MenuItem value="Tất cả">Tất cả</MenuItem>
              <MenuItem value="Hài Hước">Hài Hước</MenuItem>
              <MenuItem value="Cổ Đại">Cổ Đại</MenuItem>
              <MenuItem value="Bách Hợp">Bách Hợp</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#B0BEC5' }}>Sắp xếp</InputLabel>
            <Select value={sort} onChange={handleSortChange} sx={{ color: '#FFFFFF', backgroundColor: '#424242' }}>
              <MenuItem value="latest">Mới nhất</MenuItem>
              <MenuItem value="popular">Phổ biến</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      {error && <Typography color="error">{error}</Typography>}
      {user && user.role === 'Admin' && (
        <Button
          variant="contained"
          component={Link}
          to="/create-story"
          sx={{ mb: 2, backgroundColor: '#0288D1' }}
        >
          Tạo Truyện Mới
        </Button>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {stories && stories.length > 0 ? (
          stories.map((story) => (
            <Card key={story._id} sx={{ width: 300, backgroundColor: '#424242', color: '#FFFFFF' }}>
              {story.thumbnail && (
                <CardMedia
                  component="img"
                  height="140"
                  image={story.thumbnail}
                  alt={story.title}
                />
              )}
              <CardContent>
                <Typography variant="h6">{story.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ color: '#B0BEC5' }}>
                  Tác giả: {story.author} | Thể loại: {story.genre}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ color: '#B0BEC5' }}>
                  Trạng thái: {story.status}
                </Typography>
                {mode === 'ranking' && (
                  <Typography variant="body2" sx={{ color: '#0288D1' }}>
                    Lượt xem: {story.views}
                  </Typography>
                )}
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/story/${story._id}`}
                    size="small"
                    sx={{ backgroundColor: '#0288D1' }}
                  >
                    Đọc ngay
                  </Button>
                  {user && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleBookmark(story._id)}
                      sx={{ color: '#0288D1', borderColor: '#0288D1' }}
                    >
                      Bookmark
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>Không có truyện nào để hiển thị.</Typography>
        )}
      </Box>
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          sx={{ mt: 3, display: 'flex', justifyContent: 'center', '& .MuiPaginationItem-root': { color: '#FFFFFF' } }}
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoryList;