const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// API endpoint để lấy danh sách thư mục manga
router.get('/', async (req, res) => {
  try {
    console.log('Getting manga directories');

    // Đường dẫn đến thư mục manga
    const mangaDir = path.resolve(path.join(__dirname, '../../../frontend/public/data/manga'));
    console.log('Manga directory path:', mangaDir);

    // Kiểm tra xem thư mục có tồn tại không
    if (!fs.existsSync(mangaDir)) {
      console.log('Manga directory does not exist');
      return res.status(404).json({
        success: false,
        message: 'Manga directory not found',
        path: mangaDir
      });
    }

    // Đọc danh sách thư mục
    const items = await readdir(mangaDir);
    console.log('Items in manga directory:', items);

    // Lọc ra chỉ các thư mục
    const directories = [];
    for (const item of items) {
      const itemPath = path.join(mangaDir, item);
      const stats = await stat(itemPath);
      if (stats.isDirectory()) {
        directories.push(item);
      }
    }

    console.log('Manga directories found:', directories);

    // Trả về danh sách thư mục
    res.json(directories);
  } catch (error) {
    console.error('Error getting manga directories:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting manga directories',
      error: error.message
    });
  }
});

// API endpoint để lấy thông tin chi tiết về một manga
router.get('/:mangaId', async (req, res) => {
  try {
    const { mangaId } = req.params;
    console.log(`Getting manga details for: ${mangaId}`);

    // Đường dẫn đến thư mục manga
    const mangaPath = path.resolve(path.join(__dirname, `../../../frontend/public/data/manga/${mangaId}`));
    console.log('Manga path:', mangaPath);

    // Kiểm tra xem thư mục có tồn tại không
    if (!fs.existsSync(mangaPath)) {
      console.log(`Manga directory ${mangaId} does not exist`);
      return res.status(404).json({
        success: false,
        message: `Manga ${mangaId} not found`,
        path: mangaPath
      });
    }

    // Kiểm tra xem có file info.json không
    const infoPath = path.join(mangaPath, 'info.json');
    if (fs.existsSync(infoPath)) {
      // Đọc thông tin từ file info.json
      const infoData = fs.readFileSync(infoPath, 'utf8');
      const mangaInfo = JSON.parse(infoData);
      
      // Đảm bảo có _id
      mangaInfo._id = mangaInfo._id || mangaId;
      
      console.log(`Found info.json for ${mangaId}`);
      return res.json(mangaInfo);
    }

    // Nếu không có info.json, tạo thông tin cơ bản
    const coverPath = fs.existsSync(path.join(mangaPath, 'cover.jpg')) 
      ? `/data/manga/${mangaId}/cover.jpg` 
      : fs.existsSync(path.join(mangaPath, 'cover.png'))
        ? `/data/manga/${mangaId}/cover.png`
        : null;

    // Kiểm tra các thư mục chapter
    const chaptersPath = path.join(mangaPath, 'chapters');
    let chapterCount = 0;
    
    if (fs.existsSync(chaptersPath)) {
      const chapterDirs = await readdir(chaptersPath);
      chapterCount = chapterDirs.length;
    } else {
      // Kiểm tra các file PDF
      const files = await readdir(mangaPath);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      chapterCount = pdfFiles.length;
    }

    const basicInfo = {
      _id: mangaId,
      title: mangaId.charAt(0).toUpperCase() + mangaId.slice(1).replace(/_/g, ' '),
      thumbnail: coverPath,
      genre: 'Manga',
      genres: ['Manga'],
      rating: 5.0,
      views: 0,
      author: 'Unknown',
      status: 'Ongoing',
      description: `This is ${mangaId} manga.`,
      chapters: chapterCount || 1
    };

    console.log(`Created basic info for ${mangaId}`);
    res.json(basicInfo);
  } catch (error) {
    console.error(`Error getting manga details for ${req.params.mangaId}:`, error);
    res.status(500).json({
      success: false,
      message: `Error getting manga details for ${req.params.mangaId}`,
      error: error.message
    });
  }
});

module.exports = router;
