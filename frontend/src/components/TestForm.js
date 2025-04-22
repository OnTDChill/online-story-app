import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import axios from 'axios';

const TestForm = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('title', title);
      if (file) {
        formData.append('thumbnail', file);
      }

      console.log('Sending form data:', title, file ? file.name : 'No file');

      // Send request to test endpoint
      const result = await axios.post('http://localhost:5000/api/test-form', formData, {
        headers: {
          // Don't set Content-Type here, let axios set it with the boundary
        }
      });

      console.log('Response:', result.data);
      setResponse(result.data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>Test Form</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Choose File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          
          {file && (
            <Typography sx={{ mt: 1 }}>
              Selected file: {file.name}
            </Typography>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Submit Test Form
          </Button>
        </form>
      </Paper>
      
      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      )}
      
      {response && (
        <Paper sx={{ p: 3, bgcolor: '#e8f5e9' }}>
          <Typography variant="h6" gutterBottom>Response:</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default TestForm;
