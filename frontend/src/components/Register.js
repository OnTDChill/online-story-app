import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Tên người dùng là bắt buộc';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');

    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/user/register', formData);
      setSuccess(response.data.message);
      setFormData({ username: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Lỗi khi đăng ký!' });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', pt: 12, p: 2, backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
      <Typography variant="h4" gutterBottom>Đăng Ký</Typography>
      {errors.api && <Typography color="error">{errors.api}</Typography>}
      {success && <Typography sx={{ color: '#0288D1' }}>{success}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Tên người dùng"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.username}
          helperText={errors.username}
          InputLabelProps={{ style: { color: '#B0BEC5' } }}
          InputProps={{ style: { color: '#FFFFFF', backgroundColor: '#424242' } }}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.email}
          helperText={errors.email}
          InputLabelProps={{ style: { color: '#B0BEC5' } }}
          InputProps={{ style: { color: '#FFFFFF', backgroundColor: '#424242' } }}
        />
        <TextField
          label="Mật khẩu"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.password}
          helperText={errors.password}
          InputLabelProps={{ style: { color: '#B0BEC5' } }}
          InputProps={{ style: { color: '#FFFFFF', backgroundColor: '#424242' } }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, backgroundColor: '#0288D1' }}
        >
          Đăng Ký
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Đã có tài khoản?{' '}
        <MuiLink component={Link} to="/login" sx={{ color: '#0288D1' }}>Đăng nhập</MuiLink>
      </Typography>
    </Box>
  );
};

export default Register;