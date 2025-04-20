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
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StoriesManagement = () => {
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
      const response = await axios.get('http://localhost:5000/api/admin/stories', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
          genre: genreFilter,
          status: statusFilter
        }
      });
      setStories(response.data.stories);
      setTotalStories(response.data.total);
      setLoading(false);
    } catch (err) {
      setError('Failed to load stories');
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/genres');
      setGenres(response.data);
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
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/stories/${currentStory._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({
        open: true,
        message: 'Story updated successfully',
        severity: 'success'
      });
      
      handleCloseEditDialog();
      fetchStories();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update story',
        severity: 'error'
      });
    }
  };

  const handleDeleteStory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/stories/${currentStory._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({
        open: true,
        message: 'Story deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      fetchStories();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete story',
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
        Story Management
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="Search stories"
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
                Search
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#424242' }}>
              <InputLabel sx={{ color: '#B0BEC5' }}>Genre</InputLabel>
              <Select
                value={genreFilter}
                label="Genre"
                onChange={(e) => {
                  setGenreFilter(e.target.value);
                  handleFilterChange();
                }}
                sx={{ color: '#FFFFFF' }}
              >
                <MenuItem value="">All Genres</MenuItem>
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
              <InputLabel sx={{ color: '#B0BEC5' }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilterChange();
                }}
                sx={{ color: '#FFFFFF' }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Hành động">Hành động</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
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
              Add Story
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
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Author</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Genre</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Views</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story._id}>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.title}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.author}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.genre}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.status}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.type}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{story.views}</TableCell>
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
          />
        </TableContainer>
      )}
      
      {/* Edit Story Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Story</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.title}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
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
            label="Author"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.author}
            onChange={handleEditFormChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Genre</InputLabel>
            <Select
              name="genre"
              value={editFormData.genre}
              label="Genre"
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
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={editFormData.status}
              label="Status"
              onChange={handleEditFormChange}
            >
              <MenuItem value="Hành động">Hành động</MenuItem>
              <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={editFormData.type}
              label="Type"
              onChange={handleEditFormChange}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="vip">VIP</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateStory} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Story Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Story</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the story "{currentStory?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteStory} variant="contained" color="error">
            Delete
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
