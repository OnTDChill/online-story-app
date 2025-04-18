const path = require('path');
const createUploader = require('../config/multerStorage');

const chapterImageUpload = createUploader((req) => {
    return path.join(__dirname, '..', 'Uploads', 'tmp');
});

module.exports = chapterImageUpload;