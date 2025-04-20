import React from 'react';
import { Typography } from '@mui/material';
import ProfileComponent from './ProfileComponent';

class LeafTab extends ProfileComponent {
  constructor(name, content) {
    super();
    this.name = name;
    this.content = content;
  }

  render() {
    return (
      <div>
        <Typography variant="h6">{this.name}</Typography>
        <Typography>{this.content}</Typography>
      </div>
    );
  }
}

export default LeafTab;