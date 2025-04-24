import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * StoryPlotManagement - Quản lý cốt truyện
 */
const StoryPlotManagement = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPlot, setCurrentPlot] = useState(null);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view', 'delete'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    status: 'draft',
    characters: '',
    settings: '',
    plotPoints: ''
  });

  // Fetch data
  useEffect(() => {
    const fetchPlots = async () => {
      setLoading(true);
      try {
        // Giả lập gọi API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dữ liệu mẫu
        const samplePlots = generateSamplePlots();
        setPlots(samplePlots);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu cốt truyện:', error);
        setSnackbar({
          open: true,
          message: 'Không thể lấy dữ liệu cốt truyện',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlots();
  }, []);

  // Tạo dữ liệu mẫu
  const generateSamplePlots = () => {
    const genres = ['Hành động', 'Tình cảm', 'Phiêu lưu', 'Kinh dị', 'Hài hước', 'Kỳ ảo'];
    const statuses = ['draft', 'review', 'approved', 'published'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Cốt truyện ${i + 1}`,
      description: `Mô tả cho cốt truyện ${i + 1}. Đây là một cốt truyện hấp dẫn với nhiều tình tiết bất ngờ.`,
      genre: genres[Math.floor(Math.random() * genres.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      characters: 'Nhân vật A, Nhân vật B, Nhân vật C',
      settings: 'Bối cảnh thời gian và không gian của truyện',
      plotPoints: 'Các điểm chính trong cốt truyện',
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
    }));
  };

  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Xử lý tìm kiếm
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredPlots = plots.filter(plot =>
    plot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý mở dialog
  const handleOpenDialog = (mode, plot = null) => {
    setDialogMode(mode);
    setCurrentPlot(plot);
    
    if (mode === 'add') {
      setFormData({
        title: '',
        description: '',
        genre: '',
        status: 'draft',
        characters: '',
        settings: '',
        plotPoints: ''
      });
    } else if (mode === 'edit' && plot) {
      setFormData({
        title: plot.title,
        description: plot.description,
        genre: plot.genre,
        status: plot.status,
        characters: plot.characters,
        settings: plot.settings,
        plotPoints: plot.plotPoints
      });
    }
    
    setOpenDialog(true);
  };

  // Xử lý đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Xử lý thay đổi form
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý submit form
  const handleSubmit = () => {
    if (dialogMode === 'add') {
      // Thêm mới
      const newPlot = {
        id: plots.length + 1,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setPlots([newPlot, ...plots]);
      setSnackbar({
        open: true,
        message: 'Thêm cốt truyện thành công',
        severity: 'success'
      });
    } else if (dialogMode === 'edit') {
      // Cập nhật
      const updatedPlots = plots.map(plot => 
        plot.id === currentPlot.id 
          ? { 
              ...plot, 
              ...formData,
              updatedAt: new Date().toISOString() 
            } 
          : plot
      );
      
      setPlots(updatedPlots);
      setSnackbar({
        open: true,
        message: 'Cập nhật cốt truyện thành công',
        severity: 'success'
      });
    } else if (dialogMode === 'delete') {
      // Xóa
      const filteredPlots = plots.filter(plot => plot.id !== currentPlot.id);
      setPlots(filteredPlots);
      setSnackbar({
        open: true,
        message: 'Xóa cốt truyện thành công',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  // Xử lý đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Format thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Lấy màu cho trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'review':
        return 'info';
      case 'approved':
        return 'success';
      case 'published':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Lấy tên hiển thị cho trạng thái
  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'review':
        return 'Đang xem xét';
      case 'approved':
        return 'Đã duyệt';
      case 'published':
        return 'Đã xuất bản';
      default:
        return 'Không xác định';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Quản lý cốt truyện
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Thêm cốt truyện
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm cốt truyện..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setSearchTerm('')}
              sx={{ ml: 1 }}
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Thể loại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Cập nhật</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography>Đang tải dữ liệu...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredPlots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography>Không tìm thấy cốt truyện nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPlots
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((plot) => (
                  <TableRow key={plot.id} hover>
                    <TableCell>{plot.id}</TableCell>
                    <TableCell>{plot.title}</TableCell>
                    <TableCell>{plot.genre}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(plot.status)}
                        color={getStatusColor(plot.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(plot.createdAt)}</TableCell>
                    <TableCell>{formatDate(plot.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          color="info"
                          onClick={() => handleOpenDialog('view', plot)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog('edit', plot)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDialog('delete', plot)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPlots.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </TableContainer>
      
      {/* Dialog for Add/Edit/View/Delete */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={dialogMode === 'view' || dialogMode === 'delete' ? 'sm' : 'md'}
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' && 'Thêm cốt truyện mới'}
          {dialogMode === 'edit' && 'Chỉnh sửa cốt truyện'}
          {dialogMode === 'view' && 'Chi tiết cốt truyện'}
          {dialogMode === 'delete' && 'Xác nhận xóa'}
        </DialogTitle>
        
        <DialogContent>
          {dialogMode === 'delete' ? (
            <DialogContentText>
              Bạn có chắc chắn muốn xóa cốt truyện "{currentPlot?.title}" không? Hành động này không thể hoàn tác.
            </DialogContentText>
          ) : dialogMode === 'view' ? (
            <Box>
              <Typography variant="h6">{currentPlot?.title}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentPlot?.genre} - <Chip
                  label={getStatusLabel(currentPlot?.status)}
                  color={getStatusColor(currentPlot?.status)}
                  size="small"
                />
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Mô tả</Typography>
              <Typography variant="body2" paragraph>
                {currentPlot?.description}
              </Typography>
              
              <Typography variant="subtitle1">Nhân vật</Typography>
              <Typography variant="body2" paragraph>
                {currentPlot?.characters}
              </Typography>
              
              <Typography variant="subtitle1">Bối cảnh</Typography>
              <Typography variant="body2" paragraph>
                {currentPlot?.settings}
              </Typography>
              
              <Typography variant="subtitle1">Các điểm chính</Typography>
              <Typography variant="body2" paragraph>
                {currentPlot?.plotPoints}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="caption">
                  Ngày tạo: {formatDate(currentPlot?.createdAt)}
                </Typography>
                <Typography variant="caption">
                  Cập nhật: {formatDate(currentPlot?.updatedAt)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thể loại"
                  name="genre"
                  value={formData.genre}
                  onChange={handleFormChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    label="Trạng thái"
                  >
                    <MenuItem value="draft">Nháp</MenuItem>
                    <MenuItem value="review">Đang xem xét</MenuItem>
                    <MenuItem value="approved">Đã duyệt</MenuItem>
                    <MenuItem value="published">Đã xuất bản</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nhân vật"
                  name="characters"
                  value={formData.characters}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  placeholder="Liệt kê các nhân vật chính trong truyện"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bối cảnh"
                  name="settings"
                  value={formData.settings}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  placeholder="Mô tả bối cảnh thời gian và không gian của truyện"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Các điểm chính"
                  name="plotPoints"
                  value={formData.plotPoints}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                  placeholder="Liệt kê các điểm chính trong cốt truyện"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
          </Button>
          
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              color={dialogMode === 'delete' ? 'error' : 'primary'}
              variant="contained"
            >
              {dialogMode === 'add' && 'Thêm mới'}
              {dialogMode === 'edit' && 'Cập nhật'}
              {dialogMode === 'delete' && 'Xóa'}
            </Button>
          )}
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

export default StoryPlotManagement;
