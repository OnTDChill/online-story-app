const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { FileType } = require('file-type');

const getDestinationPath = (type) => {
  switch (type) {
    case 'avatar': return 'uploads/avatars/';
    case 'thumbnail': return 'Uploads/thumbnails/';
    case 'chapterImage': return 'Uploads/tmp/';
    default: return 'Uploads/tmp/';
  }
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dest = path.join(__dirname, '../../', getDestinationPath(req.body.type || 'tmp'));
    await fs.mkdir(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = async (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  const buffer = await fs.readFile(file.path);
  const fileType = await FileType.fromBuffer(buffer);
  
  if (!fileType || !allowedTypes.includes(fileType.mime)) {
    return cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
  cb(null, true);
};

const createUploader = (type) => {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
};

module.exports = { createUploader, getDestinationPath };