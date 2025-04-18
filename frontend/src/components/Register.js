import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/user/register', formData);
      setSuccess(response.data.message);
      setFormData({ username: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đăng ký!');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', pt: 12, p: 2, backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
      <Typography variant="h4" gutterBottom>Đăng Ký</Typography>
      {error && <Typography color="error">{error}</Typography>}
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