import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, InputBase, Box } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginLeft: theme.spacing(2),
  width: 'auto',
  [theme.breakpoints.up('sm')]: { width: '300px' }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: { width: '100%' }
  }
}));

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState('');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    handleClose();
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search) {
      navigate(`/?search=${search}`);
    }
  };

  const handleCreateStory = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/create-story');
    }
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#121212' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: '#0288D1', textDecoration: 'none', fontWeight: 'bold' }}
        >
          TRUYENHD
        </Typography>
        <Button
          color="inherit"
          component={Link}
          to="/"
          sx={{ ml: 2, color: '#B0BEC5' }}
        >
          Danh Sách
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/genres"
          sx={{ color: '#B0BEC5' }}
        >
          Thể Loại
        </Button>
        <Search>
          <SearchIconWrapper>
            <SearchIcon sx={{ color: '#B0BEC5' }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Nhập Tên Truyện..."
            inputProps={{ 'aria-label': 'search' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </Search>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          size="large"
          aria-label="account menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <AccountCircle sx={{ color: '#B0BEC5' }} />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {user ? (
            [
              <MenuItem key="profile" component={Link} to="/profile" onClick={handleClose}>
                Profile
              </MenuItem>,
              <MenuItem key="create-story" onClick={handleCreateStory}>
                Đăng Truyện
              </MenuItem>,
              <MenuItem key="manage-stories" component={Link} to="/manage-stories" onClick={handleClose}>
                Quản Lý Truyện
              </MenuItem>,
              <MenuItem key="top-up" component={Link} to="/top-up" onClick={handleClose}>
                Nạp Xèng
              </MenuItem>,
              <MenuItem key="messages" component={Link} to="/messages" onClick={handleClose}>
                Tin Nhắn
              </MenuItem>,
              <MenuItem key="logout" onClick={handleLogout}>
                Đăng Xuất
              </MenuItem>
            ]
          ) : (
            [
              <MenuItem key="login" component={Link} to="/login" onClick={handleClose}>
                Đăng Nhập / Đăng Ký
              </MenuItem>,
              <MenuItem key="create-story" onClick={handleCreateStory}>
                Đăng Truyện
              </MenuItem>
            ]
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;