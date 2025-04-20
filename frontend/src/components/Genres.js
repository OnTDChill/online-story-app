import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import BasicGenre from '../decorators/BasicGenre';
import GenreWithCountDecorator from '../decorators/GenreWithCountDecorator';

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/genres');
        const decoratedGenres = response.data.map(genre => {
          const basicGenre = new BasicGenre(genre);
          return new GenreWithCountDecorator(basicGenre);
        });
        setGenres(decoratedGenres);
      } catch (err) {
        setError('Lỗi khi tải danh sách thể loại!');
      }
    };
    fetchGenres();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 12, p: 2, backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>
        Thể Loại
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
        {genres.map((genre, index) => (
          <Box key={index}>
            {genre.render()}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Genres;