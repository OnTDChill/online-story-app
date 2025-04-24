import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StoriesManagement = ({ onActionSuccess }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStories, setTotalStories] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [genres, setGenres] = useState([]);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    author: '',
    genre: '',
    status: '',
    type: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchStories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Trong thực tế, bạn sẽ gọi API
      // Ở đây chúng ta sẽ tạo dữ liệu mẫu
      
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tạo dữ liệu mẫu
      const sampleStories = generateSampleStories();
      setStories(sampleStories);
      setTotalStories(100);
      setLoading(false);
    } catch (err) {
      setError('Failed to load stories');
      setLoading(false);
    }
  };

  // Tạo dữ liệu mẫu
  const generateSampleStories = () => {
    const statuses = ['ongoing', 'completed', 'hiatus', 'cancelled'];
    const types = ['normal', 'vip', 'premium'];
    const genreList = ['Hành động', 'Tình cảm', 'Phiêu lưu', 'Kinh dị', 'Hài hước', 'Kỳ ảo'];
    
    return Array.from({ length: rowsPerPage }, (_, i) => ({
      _id: `story-${page * rowsPerPage + i + 1}`,
      title: `Truyện ${page * rowsPerPage + i + 1}`,
      author: `Tác giả ${Math.floor((page * rowsPerPage + i) / 3) + 1}`,
      genre: genreList[Math.floor(Math.random() * genreList.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: types[Math.floor(Math.random() * types.length)],
      views: Math.floor(Math.random() * 10000),
      chapters: Math.floor(Math.random() * 100) + 1,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    }));
  };

  const fetchGenres = async () => {
    try {
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Dữ liệu mẫu
      const genreList = [
        { _id: 'genre-1', name: 'Hành động' },
        { _id: 'genre-2', name: 'Tình cảm' },
        { _id: 'genre-3', name: 'Phiêu lưu' },
        { _id: 'genre-4', name: 'Kinh dị' },
        { _id: 'genre-5', name: 'Hài hước' },
        { _id: 'genre-6', name: 'Kỳ ảo' }
      ];
      setGenres(genreList);
    } catch (err) {
      console.error('Failed to load genres', err);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchGenres();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStories();
  };

  const handleOpenEditDialog = (story) => {
    setCurrentStory(story);
    setEditFormData({
      title: story.title,
      description: story.description || '',
      author: story.author,
      genre: story.genre,
      status: story.status,
      type: story.type
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentStory(null);
  };

  const handleOpenDeleteDialog = (story) => {
    setCurrentStory(story);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentStory(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleUpdateStory = async () => {
    try {
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSnackbar({
        open: true,
        message: 'Cập nhật truyện thành công',
        severity: 'success'
      });
      
      handleCloseEditDialog();
      fetchStories();
      
      // Thông báo thành công để chuyển về trang chủ
      if (onActionSuccess) {
        onActionSuccess();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật truyện',
        severity: 'error'
      });
    }
  };

  const handleDeleteStory = async () => {
    try {
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSnackbar({
        open: true,
        message: 'Xóa truyện thành công',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      fetchStories();
      
      // Thông báo thành công để chuyển về trang chủ
      if (onActionSuccess) {
        onActionSuccess();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Không thể xóa truyện',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterChange = () => {
    setPage(0);
    fetchStories();
  };

  // Lấy màu cho trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'primary';
      case 'completed':
        return 'success';
      case 'hiatus':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Lấy tên hiển thị cho trạng thái
  const getStatusLabel = (status) => {
    switch (status) {
      case 'ongoing':
        return 'Đang tiến hành';
      case 'completed':
        return 'Hoàn thành';
      case 'hiatus':
        return 'Tạm ngưng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  if (loading && stories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: '#0288D1' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>
        Quản lý truyện
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="Tìm kiếm truyện"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  mr: 2,
                  backgroundColor: '#424242',
                  input: { color: '#FFFFFF' },
                  label: { color: '#B0BEC5' },
                  width: '100%'
                }}
              />
              <Button 
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                sx={{ backgroundColor: '#0288D1' }}
              >
                Tìm
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#424242' }}>
              <InputLabel sx={{ color: '#B0BEC5' }}>Thể loại</InputLabel>
              <Select
                value={genreFilter}
                label="Thể loại"
                onChange={(e) => {
                  setGenreFilter(e.target.value);
                  handleFilterChange();
                }}
                sx={{ color: '#FFFFFF' }}
              >
                <MenuItem value="">Tất cả thể loại</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre._id} value={genre.name}>
                    {genre.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#424242' }}>
              <InputLabel sx={{ color: '#B0BEC5' }}>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilterChange();
                }}
                sx={{ color: '#FFFFFF' }}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="ongoing">Đang tiến hành</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
                <MenuItem value="hiatus">Tạm ngưng</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              component={Link}
              to="/create-story"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: '#4CAF50', width: '100%' }}
            >
              Thêm truyện
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#424242', color: '#FFFFFF' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Tiêu đề</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Tác giả</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', minWidth: '120px' }}>Thể loại</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold', minWidth: '150px' }}>Trạng thái</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Loại</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Lượt xem</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story._id}>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.title}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.author}</TableCell>
                  <TableCell>
                    <Chip 
                      label={story.genre} 
                      sx={{ 
                        bgcolor: '#1E88E5', 
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        height: '28px'
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(story.status)} 
                      color={getStatusColor(story.status)}
                      sx={{ 
                        fontSize: '0.85rem',
                        height: '28px'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>
                    <Chip 
                      label={story.type} 
                      sx={{ 
                        bgcolor: story.type === 'vip' ? '#FFC107' : 
                                story.type === 'premium' ? '#9C27B0' : '#757575',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        height: '28px'
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.views.toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpenEditDialog(story)}
                      sx={{ color: '#0288D1' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDeleteDialog(story)}
                      sx={{ color: '#F44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalStories}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ color: '#FFFFFF' }}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </TableContainer>
      )}
      
      {/* Edit Story Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa truyện</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Tiêu đề"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.title}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Mô tả"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={editFormData.description}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            name="author"
            label="Tác giả"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.author}
            onChange={handleEditFormChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Thể loại</InputLabel>
            <Select
              name="genre"
              value={editFormData.genre}
              label="Thể loại"
              onChange={handleEditFormChange}
            >
              {genres.map((genre) => (
                <MenuItem key={genre._id} value={genre.name}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={editFormData.status}
              label="Trạng thái"
              onChange={handleEditFormChange}
            >
              <MenuItem value="ongoing">Đang tiến hành</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="hiatus">Tạm ngưng</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Loại</InputLabel>
            <Select
              name="type"
              value={editFormData.type}
              label="Loại"
              onChange={handleEditFormChange}
            >
              <MenuItem value="normal">Thường</MenuItem>
              <MenuItem value="vip">VIP</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button onClick={handleUpdateStory} variant="contained" color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Story Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xóa truyện</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa truyện "{currentStory?.title}"? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteStory} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoriesManagement;
