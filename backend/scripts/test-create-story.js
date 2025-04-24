const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testCreateStory() {
  try {
    // Create test data
    const formData = new FormData();
    formData.append('title', 'Test Story');
    formData.append('description', 'This is a test story');
    formData.append('author', 'Test Author');
    formData.append('genre', 'Hài Hước');
    formData.append('number_of_chapters', '10');
    formData.append('status', 'Hành động');
    formData.append('type', 'normal');

    console.log('Sending request to create story...');
    
    // Send request
    const response = await axios.post('http://localhost:5000/api/create-story', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testCreateStory();
