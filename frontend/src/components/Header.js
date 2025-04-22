// frontend/src/components/Header.js
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = ({ user, setUser }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [listAnchorEl, setListAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleListMenu = (event) => {
    setListAnchorEl(event.currentTarget);
  };

  const handleListClose = () => {
    setListAnchorEl(null);
  };

  const handleListOption = (mode, showAdvancedSearch = false) => {
    navigate('/stories', { state: { mode, showAdvancedSearch } });
    handleListClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#1E1E1E' }}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: '#0288D1', textDecoration: 'none' }}>
          TRUYENHD
        </Typography>
        <Button
          color="inherit"
          sx={{ color: '#FFFFFF' }}
          onClick={handleListMenu}
          endIcon={<ArrowDropDownIcon />}
        >
          Danh Sách
        </Button>
        <Menu
          anchorEl={listAnchorEl}
          open={Boolean(listAnchorEl)}
          onClose={handleListClose}
        >
          <MenuItem onClick={() => handleListOption('normal', true)}>Tìm Kiếm Nâng Cao</MenuItem>
          <MenuItem onClick={() => handleListOption('ranking')}>Bảng Xếp Hạng</MenuItem>
          <MenuItem onClick={() => handleListOption('original')}>Truyện Sáng Tác</MenuItem>
          <MenuItem onClick={() => handleListOption('translated')}>Truyện Dịch/Edit</MenuItem>
          <MenuItem onClick={() => {
            navigate('/grid');
            handleListClose();
          }}>Bảng Xếp Hạng Mới</MenuItem>
        </Menu>
        <Button color="inherit" component={Link} to="/genres" sx={{ color: '#FFFFFF' }}>
          Thể Loại
        </Button>
        {user ? (
          <>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {user.avatar ? (
                <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={Link} to="/profile" onClick={handleClose}>Hồ Sơ</MenuItem>
              {user.role === 'Admin' && (
                <MenuItem component={Link} to="/admin" onClick={handleClose}>Admin Dashboard</MenuItem>
              )}
              {user.role === 'Admin' && (
                <MenuItem component={Link} to="/create-story" onClick={handleClose}>Đăng Truyện</MenuItem>
              )}
              <MenuItem component={Link} to="/author" onClick={handleClose}>Quản Lý Truyện</MenuItem>
              <MenuItem onClick={handleLogout}>Đăng Xuất</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login" sx={{ color: '#FFFFFF' }}>Đăng Nhập</Button>
            <Button color="inherit" component={Link} to="/register" sx={{ color: '#FFFFFF' }}>Đăng Ký</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;