const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Cấu hình multer để lưu file tạm thời
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../Uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Giữ nguyên tên file gốc để dễ xử lý
    cb(null, file.originalname);
  }
});

// Lọc file, chỉ chấp nhận .cbz
const fileFilter = (req, file, cb) => {
  if (file.originalname.toLowerCase().endsWith('.cbz')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file CBZ'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 1000 } // Giới hạn 1GB
});

// Route để upload và xử lý file CBZ
router.post('/import',
  (req, res, next) => {
    console.log('Import route accessed');
    console.log('Headers:', req.headers);
    console.log('Body keys:', Object.keys(req.body));
    next();
  },
  upload.single('cbzFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không có file được tải lên' });
      }

      // Lấy thông tin từ form
      const { title, author, description, genre, status, type } = req.body;

      // Đường dẫn đến file CBZ đã upload
      const cbzFilePath = req.file.path;

      // Tên truyện (sử dụng title hoặc tên file nếu không có title)
      const mangaName = title || path.basename(req.file.originalname, '.cbz');

      // Đường dẫn đến script Python
      const pythonScriptPath = path.join(__dirname, '../../scripts/extract_cbz.py');

      // Đường dẫn đến thư mục output
      const outputDir = path.resolve(path.join(__dirname, '../../../frontend/public/data/manga'));

      // Đảm bảo thư mục output tồn tại
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      console.log('Output directory (absolute path):', outputDir);

      console.log('Executing Python script to extract CBZ...');
      console.log('CBZ file path:', cbzFilePath);
      console.log('Manga name:', mangaName);
      console.log('Output directory:', outputDir);

      // Chạy script Python để giải nén file CBZ
      // Kiểm tra xem python3 hay python có sẵn
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      console.log('Using Python command:', pythonCommand);

      const pythonProcess = spawn(pythonCommand, [
        pythonScriptPath,
        cbzFilePath,
        '--name', mangaName,
        '--output', outputDir
      ]);

      let pythonOutput = '';
      let pythonError = '';

      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
        console.log('Python stdout:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
        console.error('Python stderr:', data.toString());
      });

      pythonProcess.on('close', async (code) => {
        console.log(`Python process exited with code ${code}`);

        if (code !== 0) {
          return res.status(500).json({
            success: false,
            message: 'Lỗi khi giải nén file CBZ',
            error: pythonError
          });
        }

        try {
          console.log('Full Python output:', pythonOutput);

          // Tìm phần JSON trong output với marker
          let jsonOutput = '';
          const jsonStartMarker = 'RESULT_JSON_START';
          const jsonEndMarker = 'RESULT_JSON_END';
          const jsonStartIndex = pythonOutput.indexOf(jsonStartMarker);
          const jsonEndIndex = pythonOutput.indexOf(jsonEndMarker);

          if (jsonStartIndex >= 0 && jsonEndIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            jsonOutput = pythonOutput.substring(
              jsonStartIndex + jsonStartMarker.length,
              jsonEndIndex
            );
            console.log('Extracted JSON:', jsonOutput);
          } else {
            // Fallback: tìm kiếm JSON thông thường
            const bracketStartIndex = pythonOutput.indexOf('{');
            const bracketEndIndex = pythonOutput.lastIndexOf('}');

            if (bracketStartIndex >= 0 && bracketEndIndex >= 0 && bracketEndIndex > bracketStartIndex) {
              jsonOutput = pythonOutput.substring(bracketStartIndex, bracketEndIndex + 1);
              console.log('Extracted JSON (fallback method):', jsonOutput);
            } else {
              throw new Error('Không tìm thấy JSON trong output của Python');
            }
          }

          const mangaInfo = JSON.parse(jsonOutput);

          // Tạo thumbnail path
          const thumbnailPath = mangaInfo.cover;

          // Tạo story mới trong database
          const story = new Story({
            title: mangaName,
            description: description || `Truyện được import từ file CBZ: ${req.file.originalname}`,
            author: author || 'Unknown',
            genre: genre || 'Manga',
            thumbnail: thumbnailPath,
            status: status || 'ongoing',
            type: type || 'normal',
            number_of_chapters: 1
          });

          // Lưu story vào database
          const savedStory = await story.save();
          console.log('Story saved successfully:', savedStory._id);

          // Tạo chapter mới
          const chapter = new Chapter({
            story: savedStory._id,
            chapter_number: 1,
            title: 'Chapter 1',
            content: JSON.stringify({
              images: mangaInfo.chapter_images,
              pages: mangaInfo.pages
            })
          });

          // Lưu chapter vào database
          const savedChapter = await chapter.save();
          console.log('Chapter saved successfully:', savedChapter._id);

          // Xóa file CBZ tạm thời
          fs.unlinkSync(cbzFilePath);

          // Trả về kết quả thành công
          res.status(200).json({
            success: true,
            message: 'Import thành công: ' + mangaName,
            storyId: savedStory._id,
            thumbnailPath: thumbnailPath,
            chapterId: savedChapter._id
          });
        } catch (error) {
          console.error('Error processing Python output:', error);
          res.status(500).json({
            success: false,
            message: 'Lỗi khi xử lý kết quả từ Python script',
            error: error.message
          });
        }
      });
    } catch (error) {
      console.error('Error importing CBZ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi import CBZ',
        error: error.message
      });
    }
  }
);

// Route để lấy danh sách truyện đã import
router.get('/imported', async (req, res) => {
  try {
    const stories = await Story.find({ type: 'normal' }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
});

// Route test đơn giản
router.get('/test', (req, res) => {
  console.log('CBZ test route accessed');
  res.json({ success: true, message: 'CBZ route is working!' });
});

// Route test upload
router.post('/test-upload', upload.single('testFile'), (req, res) => {
  console.log('CBZ test upload route accessed');
  console.log('File:', req.file);
  console.log('Body:', req.body);

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    }
  });
});

// Route đơn giản để import CBZ
router.post('/simple-import', upload.single('cbzFile'), async (req, res) => {
  console.log('Simple CBZ import route accessed');
  console.log('File:', req.file);
  console.log('Body:', req.body);

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file được tải lên' });
  }

  try {
    // Đường dẫn đến file CBZ đã upload
    const cbzFilePath = req.file.path;
    console.log('CBZ file path:', cbzFilePath);

    // Tên truyện (sử dụng title hoặc tên file nếu không có title)
    const fileName = req.file.originalname;
    const mangaName = req.body.title || path.basename(fileName, '.cbz');
    console.log('Manga name:', mangaName);

    // Đường dẫn đến script Python
    const pythonScriptPath = path.join(__dirname, '../../scripts/extract_cbz.py');
    console.log('Python script path:', pythonScriptPath);

    // Đường dẫn đến thư mục output
    const outputDir = path.resolve(path.join(__dirname, '../../../frontend/public/data/manga'));
    console.log('Output directory:', outputDir);

    // Đảm bảo thư mục output tồn tại
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Chạy script Python để giải nén file CBZ
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    console.log('Using Python command:', pythonCommand);

    const pythonProcess = spawn(pythonCommand, [
      pythonScriptPath,
      cbzFilePath,
      '--name', mangaName,
      '--output', outputDir
    ]);

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      pythonOutput += output;
      console.log('Python stdout:', output);
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      pythonError += error;
      console.error('Python stderr:', error);
    });

    // Xử lý khi script Python hoàn tất
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', async (code) => {
        console.log(`Python process exited with code ${code}`);

        if (code !== 0) {
          reject(new Error(`Python script failed with code ${code}: ${pythonError}`));
          return;
        }

        try {
          // Tìm phần JSON trong output
          let jsonOutput = '';
          const jsonStartMarker = 'RESULT_JSON_START';
          const jsonEndMarker = 'RESULT_JSON_END';
          const jsonStartIndex = pythonOutput.indexOf(jsonStartMarker);
          const jsonEndIndex = pythonOutput.indexOf(jsonEndMarker);

          if (jsonStartIndex >= 0 && jsonEndIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            jsonOutput = pythonOutput.substring(
              jsonStartIndex + jsonStartMarker.length,
              jsonEndIndex
            );
            console.log('Extracted JSON:', jsonOutput);
          } else {
            // Fallback: tìm kiếm JSON thông thường
            const bracketStartIndex = pythonOutput.indexOf('{');
            const bracketEndIndex = pythonOutput.lastIndexOf('}');

            if (bracketStartIndex >= 0 && bracketEndIndex >= 0 && bracketEndIndex > bracketStartIndex) {
              jsonOutput = pythonOutput.substring(bracketStartIndex, bracketEndIndex + 1);
              console.log('Extracted JSON (fallback method):', jsonOutput);
            } else {
              reject(new Error('Không tìm thấy JSON trong output của Python'));
              return;
            }
          }

          const mangaInfo = JSON.parse(jsonOutput);

          // Tạo story mới trong database
          const story = new Story({
            title: mangaName,
            description: req.body.description || `Truyện được import từ file CBZ: ${fileName}`,
            author: req.body.author || 'Unknown',
            genre: req.body.genre || 'Manga',
            thumbnail: mangaInfo.cover,
            status: req.body.status || 'ongoing',
            type: req.body.type || 'normal',
            number_of_chapters: 1
          });

          // Lưu story vào database
          const savedStory = await story.save();
          console.log('Story saved successfully:', savedStory._id);

          // Tạo chapter mới
          const chapter = new Chapter({
            story: savedStory._id,
            chapter_number: 1,
            title: 'Chapter 1',
            content: JSON.stringify({
              images: mangaInfo.chapter_images,
              pages: mangaInfo.pages
            })
          });

          // Lưu chapter vào database
          const savedChapter = await chapter.save();
          console.log('Chapter saved successfully:', savedChapter._id);

          // Xóa file CBZ tạm thời
          fs.unlinkSync(cbzFilePath);

          resolve({
            success: true,
            message: 'Import thành công: ' + mangaName,
            storyId: savedStory._id,
            thumbnailPath: mangaInfo.cover,
            chapterId: savedChapter._id,
            mangaInfo: mangaInfo
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    // Trả về kết quả thành công
    res.status(200).json({
      success: true,
      message: 'Import thành công: ' + mangaName,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error importing CBZ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi import CBZ: ' + error.message,
      error: error.stack
    });
  }
});

// API endpoint để lấy danh sách thư mục manga
router.get('/manga-directories', async (req, res) => {
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
        // Kiểm tra xem thư mục có chứa info.json không
        const infoPath = path.join(itemPath, 'info.json');
        if (fs.existsSync(infoPath)) {
          directories.push(item);
        } else {
          console.log(`Directory ${item} does not have info.json, skipping`);
        }
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

module.exports = router;
