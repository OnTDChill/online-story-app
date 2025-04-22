const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const port = 5002; // Use a different port to avoid conflicts

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'form-test-uploads');
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
  res.json({ message: 'Form test server is running!' });
});

// Form submission route
app.post('/api/create-story', upload.single('thumbnail'), (req, res) => {
  console.log('Form submission received:');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  
  res.json({
    message: 'Form data received successfully',
    body: req.body,
    file: req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null
  });
});

// Start server
app.listen(port, () => {
  console.log(`Form test server running at http://localhost:${port}`);
});
