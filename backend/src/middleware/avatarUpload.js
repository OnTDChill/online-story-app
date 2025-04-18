const path = require('path');
const createUploader = require('../config/multerStorage');

const avatarUpload = createUploader(() => {
  return path.join(__dirname, '..', 'Uploads', 'tmp');
});

module.exports = avatarUpload;