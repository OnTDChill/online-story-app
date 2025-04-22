const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const port = 5001; // Use a different port to avoid conflicts

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'Uploads', 'simple');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating upload directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Saving file to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`;
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Simple server is running!' });
});

// Form submission route
app.post('/api/create-story', upload.single('thumbnail'), async (req, res) => {
  console.log('Form submission received:');
  console.log('Body:', req.body);
  console.log('File:', req.file);

  try {
    // Extract data from form
    const { title, description, author, genre, number_of_chapters, status, type } = req.body;

    // Validate required fields
    if (!title || !author || !genre || !number_of_chapters) {
      return res.status(400).json({
        message: 'Missing required fields',
        received: { title, author, genre, number_of_chapters }
      });
    }

    // Return success response with full URL for the thumbnail
    res.json({
      message: 'Story data received successfully',
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `http://localhost:${port}/uploads/simple/${req.file.filename}`
      } : null
    });
  } catch (error) {
    console.error('Error processing story data:', error);
    res.status(500).json({
      message: error.message || 'Server error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Simple server running at http://localhost:${port}`);
});
