import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Box, Typography, CircularProgress, Snackbar, Alert, FormControl, InputLabel, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateStory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    genre: '',
    number_of_chapters: '',
    status: 'Hành động',
    type: 'normal'
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Fetch genres when component mounts
    const fetchGenres = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/genres');
        setGenres(response.data);
      } catch (err) {
        console.error('Failed to load genres', err);
      }
    };

    fetchGenres();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Create a new FormData object
      const data = new FormData();

      // Add each field individually with console logs
      console.log('Adding title:', formData.title);
      data.append('title', formData.title);

      console.log('Adding description:', formData.description);
      data.append('description', formData.description);

      console.log('Adding author:', formData.author);
      data.append('author', formData.author);

      console.log('Adding genre:', formData.genre);
      data.append('genre', formData.genre);

      console.log('Adding number_of_chapters:', formData.number_of_chapters);
      data.append('number_of_chapters', formData.number_of_chapters);

      console.log('Adding status:', formData.status);
      data.append('status', formData.status);

      console.log('Adding type:', formData.type);
      data.append('type', formData.type);

      // Add thumbnail if it exists
      if (thumbnail) {
        console.log('Adding thumbnail:', thumbnail.name);
        data.append('thumbnail', thumbnail);
      }

      // Log the FormData (note: FormData can't be directly logged)
      console.log('FormData created with fields:',
        Array.from(data.entries()).map(entry => `${entry[0]}: ${entry[1]}`))

      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');

      // Make the API request
      console.log('Sending request to API endpoint: http://localhost:5000/api/create-story');
      const response = await axios.post('http://localhost:5000/api/create-story', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type here, let axios set it with the boundary
        }
      });

      console.log('API response:', response.data);
      setSuccess(response.data.message);
      setSnackbar({
        open: true,
        message: 'Story created successfully!',
        severity: 'success'
      });

      // Redirect to stories management after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err) {
      console.error('Error creating story:', err);
      console.error('Error details:', err.response?.data || 'No response data');
      console.error('Error status:', err.response?.status || 'No status code');
      console.error('Error message:', err.message || 'No error message');

      // Set a more detailed error message
      const errorMessage = err.response?.data?.message || err.message || 'Error creating story!';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 3, bgcolor: '#1E1E1E', color: '#FFFFFF', borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>Create New Story</Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {success && <Typography sx={{ color: '#4CAF50', mb: 2 }}>{success}</Typography>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{
            mb: 2,
            '& .MuiInputBase-input': { color: '#FFFFFF' },
            '& .MuiInputLabel-root': { color: '#B0BEC5' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#424242' },
              '&:hover fieldset': { borderColor: '#0288D1' },
            },
            backgroundColor: '#424242'
          }}
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          sx={{
            mb: 2,
            '& .MuiInputBase-input': { color: '#FFFFFF' },
            '& .MuiInputLabel-root': { color: '#B0BEC5' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#424242' },
              '&:hover fieldset': { borderColor: '#0288D1' },
            },
            backgroundColor: '#424242'
          }}
        />

        <TextField
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{
            mb: 2,
            '& .MuiInputBase-input': { color: '#FFFFFF' },
            '& .MuiInputLabel-root': { color: '#B0BEC5' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#424242' },
              '&:hover fieldset': { borderColor: '#0288D1' },
            },
            backgroundColor: '#424242'
          }}
        />

        <FormControl fullWidth margin="normal" sx={{ mb: 2, backgroundColor: '#424242' }}>
          <InputLabel sx={{ color: '#B0BEC5' }}>Genre</InputLabel>
          <Select
            name="genre"
            value={formData.genre}
            label="Genre"
            onChange={handleChange}
            required
            sx={{ color: '#FFFFFF' }}
          >
            {genres.map((genre) => (
              <MenuItem key={genre._id} value={genre.name}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Number of Chapters"
          name="number_of_chapters"
          type="number"
          value={formData.number_of_chapters}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          sx={{
            mb: 2,
            '& .MuiInputBase-input': { color: '#FFFFFF' },
            '& .MuiInputLabel-root': { color: '#B0BEC5' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#424242' },
              '&:hover fieldset': { borderColor: '#0288D1' },
            },
            backgroundColor: '#424242'
          }}
        />

        <FormControl fullWidth margin="normal" sx={{ mb: 2, backgroundColor: '#424242' }}>
          <InputLabel sx={{ color: '#B0BEC5' }}>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            label="Status"
            onChange={handleChange}
            sx={{ color: '#FFFFFF' }}
          >
            <MenuItem value="Hành động">Hành động</MenuItem>
            <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" sx={{ mb: 2, backgroundColor: '#424242' }}>
          <InputLabel sx={{ color: '#B0BEC5' }}>Story Type</InputLabel>
          <Select
            name="type"
            value={formData.type}
            label="Story Type"
            onChange={handleChange}
            sx={{ color: '#FFFFFF' }}
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="vip">VIP</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{ mt: 2, mb: 2, backgroundColor: '#424242', color: '#FFFFFF' }}
        >
          Choose Cover Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>

        {thumbnail && (
          <Typography sx={{ mt: 1, mb: 2, color: '#0288D1' }}>
            Selected file: {thumbnail.name}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2, backgroundColor: '#0288D1' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Story'}
        </Button>
      </form>

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

export default CreateStory;