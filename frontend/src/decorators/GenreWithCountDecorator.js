import React from 'react';
import { Box, Typography } from '@mui/material';
import GenreComponent from './GenreComponent';

class GenreWithCountDecorator extends GenreComponent {
  constructor(component) {
    super();
    this.component = component;
  }

  render() {
    return (
      <Box sx={{ textAlign: 'center' }}>
        {this.component.render()}
        <Typography sx={{ color: '#B0BEC5', fontSize: '0.8rem', mt: 0.5 }}>
          {this.component.genre.storyCount} truyện
        </Typography>
      </Box>
    );
  }
}

export default GenreWithCountDecorator;