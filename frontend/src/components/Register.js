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
      console.log('Sending registration request with:', formData);
      const response = await axios.post('http://localhost:5000/api/user/register', formData);
      console.log('Registration response:', response.data);
      setSuccess(response.data.message || 'Đăng ký thành công!');
      setFormData({ username: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);

      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.data?.errors) {
          // Handle validation errors
          const validationErrors = {};
          err.response.data.errors.forEach(error => {
            validationErrors[error.param] = error.msg;
          });
          setErrors({ ...validationErrors, api: 'Vui lòng kiểm tra lại thông tin đăng ký.' });
        } else {
          setErrors({ api: err.response.data?.message || `Lỗi máy chủ: ${err.response.status}` });
        }
      } else if (err.request) {
        // The request was made but no response was received
        setErrors({ api: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.' });
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrors({ api: `Lỗi: ${err.message}` });
      }
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