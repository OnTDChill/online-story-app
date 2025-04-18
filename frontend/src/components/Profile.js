import React from 'react';
import { Box, Typography, Avatar, Button, List, ListItem, ListItemText, TextField } from '@mui/material';

const Profile = ({ user }) => {
  if (!user) {
    return <Typography sx={{ mt: 12, ml: 4, color: '#FFFFFF' }}>Vui lòng đăng nhập!</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', mt: 12, mx: 'auto', maxWidth: 1200, p: 2, backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
      {/* Sidebar */}
      <Box sx={{ width: 250, mr: 4 }}>
        <Typography variant="h6" gutterBottom>Khu Vực Tác Giả</Typography>
        <List>
          {[
            'Khu Vực Tác Giả',
            'Tin Nhắn',
            'Tủ Truyện',
            'Nhiệm Vụ',
            'Nạp Tiền',
            'Rút Tiền',
            'Thành Viên',
            'Cài Đặt Cá Nhân',
            'Đăng Xuất'
          ].map((item) => (
            <ListItem key={item} button sx={{ color: '#B0BEC5' }}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* User Card */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 2, backgroundColor: '#424242', borderRadius: 2 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 2 }} />
          <Box>
            <Typography variant="h5">{user.username || 'THANH DAT'}</Typography>
            <Typography>{user.email}</Typography>
            <Typography>0 Vàng</Typography>
            <Typography>TruyenHD ID thành viên: {user._id || '97708A'}</Typography>
          </Box>
        </Box>

        {/* Profile Info */}
        <Typography variant="h6" gutterBottom>Profile</Typography>
        <Box sx={{ p: 2, backgroundColor: '#424242', borderRadius: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 2 }} />
            <Button variant="contained" sx={{ backgroundColor: '#0288D1' }}>
              Upload
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography>Nickname: {user.username || 'THANH DAT'}</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Chức vụ: Thành Viên</Typography>
              <Typography>Refer: 0 user</Typography>
              <Typography>Điểm danh: Nhận Vàng miễn phí</Typography>
            </Box>
            <Box>
              <Typography>Ảnh Kèm: 0</Typography>
              <Typography>Ruby: 0</Typography>
              <Typography>Vé bổ cáo: 0</Typography>
              <Typography>Điểm SVIP: 0</Typography>
              <Typography>Khung avatar: Chỉ có trên app</Typography>
            </Box>
          </Box>
        </Box>

        {/* Favorite Quote */}
        <Typography variant="h6" gutterBottom>Trích Dẫn Yêu Thích</Typography>
        <Box sx={{ p: 2, backgroundColor: '#424242', borderRadius: 2, mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Nội dung này sẽ được hiển thị công khai ở trang cá nhân"
            variant="outlined"
            sx={{ backgroundColor: '#FFFFFF', borderRadius: 1 }}
          />
          <Button variant="contained" sx={{ mt: 2, backgroundColor: '#0288D1' }}>
            Cập Nhật
          </Button>
        </Box>

        {/* Nickname Section */}
        <Typography variant="h6" gutterBottom>Nickname</Typography>
        <Box sx={{ p: 2, backgroundColor: '#424242', borderRadius: 2, mb: 4 }}>
          <Typography>Nickname: {user.username || 'THANH DAT'}</Typography>
          <Button variant="outlined" sx={{ mt: 2, color: '#B0BEC5', borderColor: '#B0BEC5' }}>
            Thay Đổi
          </Button>
        </Box>

        {/* Social Link */}
        <Typography variant="h6" gutterBottom>Địa Chỉ Trang Cá Nhân</Typography>
        <Box sx={{ p: 2, backgroundColor: '#424242', borderRadius: 2 }}>
          <Typography>https://truyenhd.com/author/{user._id || '1744968634'}</Typography>
          <Button variant="outlined" sx={{ mt: 2, color: '#B0BEC5', borderColor: '#B0BEC5' }}>
            Thay Đổi
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;