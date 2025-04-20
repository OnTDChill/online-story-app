import React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import GenreComponent from './GenreComponent';

class BasicGenre extends GenreComponent {
  constructor(genre) {
    super();
    this.genre = genre;
  }

  render() {
    return (
      <Button
        component={Link}
        to={`/stories?genre=${encodeURIComponent(this.genre.name)}`}
        sx={{
          backgroundColor: '#424242',
          color: '#FFFFFF',
          p: 2,
          textAlign: 'center',
          textTransform: 'none',
          '&:hover': { backgroundColor: '#0288D1' },
        }}
      >
        {this.genre.name}
      </Button>
    );
  }
}

export default BasicGenre;