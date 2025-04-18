import React, { useState } from 'react';
import { TextField, Button, MenuItem, Box, Typography } from '@mui/material';
import axios from 'axios';

const CreateStory = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    genre: '',
    number_of_chapters: '',
    status: 'ongoing',
    type: 'normal'
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (thumbnail) data.append('thumbnail', thumbnail);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/stories', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(response.data.message);
      setFormData({
        title: '',
        description: '',
        author: '',
        genre: '',
        number_of_chapters: '',
        status: 'ongoing',
        type: 'normal'
      });
      setThumbnail(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo truyện!');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>Tạo Truyện Mới</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success.main">{success}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Tiêu đề"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <TextField
          label="Tác giả"
          name="author"
          value={formData.author}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Thể loại"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Số chương"
          name="number_of_chapters"
          type="number"
          value={formData.number_of_chapters}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          select
          label="Trạng thái"
          name="status"
          value={formData.status}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="ongoing">Đang tiến hành</MenuItem>
          <MenuItem value="completed">Hoàn thành</MenuItem>
        </TextField>
        <TextField
          select
          label="Loại truyện"
          name="type"
          value={formData.type}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="normal">Thông thường</MenuItem>
          <MenuItem value="vip">VIP</MenuItem>
        </TextField>
        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{ mt: 2 }}
        >
          Chọn ảnh bìa
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        {thumbnail && <Typography sx={{ mt: 1 }}>{thumbnail.name}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Tạo Truyện
        </Button>
      </form>
    </Box>
  );
};

export default CreateStory;