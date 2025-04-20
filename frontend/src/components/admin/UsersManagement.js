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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: '',
    diamonds: 0,
    rubies: 0,
    svipPoints: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        }
      });
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm]);

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
    fetchUsers();
  };

  const handleOpenEditDialog = (user) => {
    setCurrentUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      diamonds: user.diamonds,
      rubies: user.rubies,
      svipPoints: user.svipPoints
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentUser(null);
  };

  const handleOpenDeleteDialog = (user) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentUser(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'diamonds' || name === 'rubies' || name === 'svipPoints' 
        ? parseInt(value, 10) 
        : value
    });
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/users/${currentUser._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
      
      handleCloseEditDialog();
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update user',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/users/${currentUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: '#0288D1' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>
        User Management
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search users"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              mr: 2,
              backgroundColor: '#424242',
              input: { color: '#FFFFFF' },
              label: { color: '#B0BEC5' }
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
      </Box>
      
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#424242', color: '#FFFFFF' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Username</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Diamonds</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Rubies</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>SVIP Points</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell sx={{ color: '#FFFFFF' }}>{user.username}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{user.role}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{user.diamonds}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{user.rubies}</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>{user.svipPoints}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpenEditDialog(user)}
                      sx={{ color: '#0288D1' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDeleteDialog(user)}
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
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ color: '#FFFFFF' }}
          />
        </TableContainer>
      )}
      
      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.username}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editFormData.email}
            onChange={handleEditFormChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={editFormData.role}
              label="Role"
              onChange={handleEditFormChange}
            >
              <MenuItem value="Member">Member</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="diamonds"
            label="Diamonds"
            type="number"
            fullWidth
            variant="outlined"
            value={editFormData.diamonds}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            name="rubies"
            label="Rubies"
            type="number"
            fullWidth
            variant="outlined"
            value={editFormData.rubies}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            name="svipPoints"
            label="SVIP Points"
            type="number"
            fullWidth
            variant="outlined"
            value={editFormData.svipPoints}
            onChange={handleEditFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user "{currentUser?.username}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
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

export default UsersManagement;
