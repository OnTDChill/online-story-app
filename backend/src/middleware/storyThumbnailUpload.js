const path = require('path');
const createUploader = require('../config/multerStorage');

const storyThumbnailUpload = createUploader(() => {
  return path.join(__dirname, '..', 'Uploads', 'tmp');
});

module.exports = storyThumbnailUpload;