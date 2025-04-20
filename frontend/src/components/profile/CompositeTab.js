import React from 'react';
import { Box, Typography } from '@mui/material';
import ProfileComponent from './ProfileComponent';

class CompositeTab extends ProfileComponent {
  constructor(name) {
    super();
    this.name = name;
    this.children = [];
  }

  add(component) {
    this.children.push(component);
  }

  remove(component) {
    this.children = this.children.filter(child => child !== component);
  }

  render() {
    return (
      <Box>
        <Typography variant="h6">{this.name}</Typography>
        {this.children.map((child, index) => (
          <Box key={index} sx={{ ml: 2, mt: 1 }}>
            {child.render()}
          </Box>
        ))}
      </Box>
    );
  }
}

export default CompositeTab;