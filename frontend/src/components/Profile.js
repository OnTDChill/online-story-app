import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Tabs, Tab, TextField, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import LeafTab from './profile/LeafTab';
import CompositeTab from './profile/CompositeTab';

const Profile = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [tabs, setTabs] = useState([]);
  const [profile, setProfile] = useState(user);
  const [favoriteQuote, setFavoriteQuote] = useState(user?.favoriteQuote || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [personalLink, setPersonalLink] = useState(user?.personalLink || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const khuVucTacGia = new CompositeTab('Khu vực Tác Giả');
    khuVucTacGia.add(new LeafTab('Truyện đã đăng', 'Danh sách truyện bạn đã đăng (chưa triển khai)'));
    khuVucTacGia.add(new LeafTab('Truyện đang viết', 'Danh sách truyện đang viết (chưa triển khai)'));
    const tinNhan = new LeafTab('Tin Nhắn', 'Danh sách tin nhắn (chưa triển khai)');
    const tuiTruyen = new LeafTab('Túi Truyện', 'Danh sách truyện đã lưu (chưa triển khai)');
    const nhiemVu = new LeafTab('Nhiệm Vụ', 'Nhiệm vụ hàng ngày (chưa triển khai)');
    const napTien = new LeafTab('Nạp Tiền', 'Nạp tiền để mua Kim cương/Ruby (chưa triển khai)');
    const rutTien = new LeafTab('Rút Tiền', 'Rút tiền từ tài khoản (chưa triển khai)');
    const thanhVien = new LeafTab('Thành Viên', 'Quyền lợi thành viên (chưa triển khai)');
    const caiDatCaNhan = new LeafTab('Cài Đặt Cá Nhân', 'Cài đặt tài khoản (chưa triển khai)');
    setTabs([khuVucTacGia, tinNhan, tuiTruyen, nhiemVu, napTien, rutTien, thanhVien, caiDatCaNhan]);
  }, []);

  if (!user) return <Typography sx={{ pt: 12, ml: 4, color: '#FFFFFF' }}>Vui lòng đăng nhập</Typography>;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post('http://localhost:5000/api/user/upload-avatar', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile({ ...profile, avatar: response.data.avatar });
      setSnackbar({ open: true, message: 'Upload avatar thành công!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi upload avatar!', severity: 'error' });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put('http://localhost:5000/api/user/profile', {
        favoriteQuote,
        nickname,
        personalLink,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProfile(response.data.user);
      setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật thông tin!', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 12, p: 2, backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>Profile</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ width: 80, height: 80, mr: 2 }} src={profile.avatar} />
        <Box>
          <Typography variant="h5">{profile.username.toUpperCase()}</Typography>
          <Typography>Email: {profile.email}</Typography>
          <Typography>Chức vụ: {profile.role === 'Admin' ? 'Admin' : 'Thành Viên'}</Typography>
          <Typography>Kim cương: {profile.diamonds}</Typography>
          <Typography>Ruby: {profile.rubies}</Typography>
          <Typography>Điểm SVIP: {profile.svipPoints}</Typography>
        </Box>
        <Button
          variant="contained"
          component="label"
          sx={{ ml: 2, backgroundColor: '#0288D1' }}
        >
          Upload
          <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
        </Button>
      </Box>
      <Box sx={{ display: 'flex', mb: 4 }}>
        <Tabs
          orientation="vertical"
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.name} sx={{ color: '#FFFFFF' }} />
          ))}
        </Tabs>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {tabs[tabValue]?.render()}
        </Box>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Trích dẫn yêu thích</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={favoriteQuote}
          onChange={(e) => setFavoriteQuote(e.target.value)}
          sx={{ backgroundColor: '#424242', input: { color: '#FFFFFF' } }}
        />
        <Button
          variant="contained"
          onClick={handleUpdateProfile}
          sx={{ mt: 2, backgroundColor: '#0288D1' }}
        >
          Cập nhật
        </Button>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Ngoại hiệu</Typography>
        <TextField
          fullWidth
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          sx={{ backgroundColor: '#424242', input: { color: '#FFFFFF' } }}
        />
        <Button
          variant="contained"
          onClick={handleUpdateProfile}
          sx={{ mt: 2, backgroundColor: '#0288D1' }}
        >
          Thay đổi
        </Button>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Địa chỉ trang cá nhân</Typography>
        <TextField
          fullWidth
          value={personalLink}
          onChange={(e) => setPersonalLink(e.target.value)}
          sx={{ backgroundColor: '#424242', input: { color: '#FFFFFF' } }}
        />
        <Button
          variant="contained"
          onClick={handleUpdateProfile}
          sx={{ mt: 2, backgroundColor: '#0288D1' }}
        >
          Thay đổi
        </Button>
      </Box>
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

export default Profile;