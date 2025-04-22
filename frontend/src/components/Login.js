import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Login attempt with:', formData);

    try {
      console.log('Sending request to:', 'http://localhost:5000/api/user/login');
      const response = await axios.post('http://localhost:5000/api/user/login', formData);
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);

      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data?.message || `Lỗi máy chủ: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Lỗi: ${err.message}`);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', pt: 12, p: 2, backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
      <Typography variant="h4" gutterBottom>Đăng Nhập</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
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
          InputLabelProps={{ style: { color: '#B0BEC5' } }}
          InputProps={{ style: { color: '#FFFFFF', backgroundColor: '#424242' } }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, backgroundColor: '#0288D1' }}
        >
          Đăng Nhập
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Chưa có tài khoản?{' '}
        <MuiLink component={Link} to="/register" sx={{ color: '#0288D1' }}>Đăng ký</MuiLink>
      </Typography>
    </Box>
  );
};

export default Login;