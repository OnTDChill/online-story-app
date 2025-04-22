import React from 'react';
import { Box, Container } from '@mui/material';
import StoryGrid from '../components/StoryGrid';

const HomePage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
        <StoryGrid />
      </Box>
    </Container>
  );
};

export default HomePage;
