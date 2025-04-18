const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Hàm tạo storage chung cho mọi mục đích
const createStorage = (getDestinationPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = getDestinationPath(req); // Lấy đường dẫn từ routes
      fs.mkdirSync(uploadPath, { recursive: true }); // Tạo thư mục nếu chưa tồn tại
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    }
  });
};

// Hàm tạo middleware upload file
const createUploader = (getDestinationPath) => {
  return multer({ storage: createStorage(getDestinationPath) });
};

module.exports = createUploader;