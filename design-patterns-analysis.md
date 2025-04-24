# Phân tích các mẫu thiết kế trong Online Story App

## 1. Middleware Pattern

### Mô tả
Middleware Pattern là một mẫu thiết kế hành vi cho phép xử lý request HTTP qua một chuỗi các hàm middleware trước khi đến route handler cuối cùng. Mỗi middleware có thể thực hiện một nhiệm vụ cụ thể và quyết định có chuyển request đến middleware tiếp theo hay không.

### Hiện thực trong dự án
Trong Express.js, Middleware Pattern được sử dụng rộng rãi:

```javascript
// Middleware xử lý CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Middleware xử lý JSON body
app.use(express.json());

// Middleware xử lý URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Middleware xác thực
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

### Lợi ích
- **Tách biệt mối quan tâm**: Mỗi middleware chỉ xử lý một nhiệm vụ cụ thể
- **Tái sử dụng**: Middleware có thể được tái sử dụng ở nhiều route khác nhau
- **Dễ mở rộng**: Dễ dàng thêm middleware mới vào chuỗi xử lý

## 2. Module Pattern

### Mô tả
Module Pattern là một mẫu thiết kế cho phép tổ chức code thành các module riêng biệt, giúp quản lý code dễ dàng hơn và tăng tính tái sử dụng.

### Hiện thực trong dự án
Dự án sử dụng hệ thống module của Node.js để tổ chức code:

```javascript
// Trong server.js
const connectDB = require('./src/config/db');
const { port, nodeEnv, JWT_SECRET } = require('./src/config/env');
const storyThumbnailUpload = require('./src/middleware/storyThumbnailUpload');
const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
```

### Lợi ích
- **Tổ chức code**: Code được tổ chức thành các module có chức năng rõ ràng
- **Tái sử dụng**: Các module có thể được tái sử dụng ở nhiều nơi
- **Dễ bảo trì**: Dễ dàng sửa đổi một module mà không ảnh hưởng đến các phần khác

## 3. Factory Pattern

### Mô tả
Factory Pattern là một mẫu thiết kế tạo đối tượng, cung cấp một giao diện để tạo đối tượng trong lớp cha, nhưng cho phép các lớp con thay đổi loại đối tượng sẽ được tạo.

### Hiện thực trong dự án
Trong dự án, Factory Pattern được sử dụng để tạo các đối tượng Story và Chapter:

```javascript
// Tạo đối tượng Story
const story = new Story({
  title,
  description: description || '',
  author,
  genre,
  thumbnail: req.file ? `http://localhost:${port}/uploads/temp/${req.file.filename}` : null,
  number_of_chapters: parseInt(number_of_chapters, 10),
  status: status || 'Hành động',
  type: type || 'normal',
  isVip: type === 'vip'
});

// Tạo đối tượng Chapter
const chapter = new Chapter({
  story: storyId,
  chapter_number: chapterNumber,
  title: chapterTitle,
  content: chapterContent
});
```

### Lợi ích
- **Tách biệt logic tạo đối tượng**: Logic tạo đối tượng được tách biệt khỏi logic sử dụng
- **Dễ mở rộng**: Dễ dàng thêm các loại đối tượng mới
- **Đóng gói**: Chi tiết tạo đối tượng được đóng gói trong factory

## 4. Singleton Pattern

### Mô tả
Singleton Pattern đảm bảo rằng một lớp chỉ có một thể hiện và cung cấp một điểm truy cập toàn cục đến nó.

### Hiện thực trong dự án
Kết nối MongoDB là một ví dụ của Singleton Pattern:

```javascript
// src/config/db.js
const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Lợi ích
- **Tiết kiệm tài nguyên**: Chỉ tạo một kết nối database duy nhất
- **Truy cập toàn cục**: Cung cấp điểm truy cập toàn cục đến kết nối
- **Khởi tạo trễ**: Kết nối chỉ được tạo khi cần thiết

## 5. Observer Pattern

### Mô tả
Observer Pattern định nghĩa một sự phụ thuộc một-nhiều giữa các đối tượng, khi một đối tượng thay đổi trạng thái, tất cả các đối tượng phụ thuộc sẽ được thông báo và cập nhật tự động.

### Hiện thực trong dự án
ReadingProgressManager sử dụng Observer Pattern để theo dõi và cập nhật tiến độ đọc:

```javascript
// Lưu tiến trình đọc định kỳ
setInterval(() => {
  ReadingProgressManager.saveProgressToDatabase(ReadingProgress);
}, 5 * 60 * 1000);

// ReadingProgressManager.js
class ReadingProgressManager {
  static progressMap = new Map();

  static updateProgress(userId, storyId, chapterId) {
    const key = `${userId}-${storyId}`;
    this.progressMap.set(key, {
      userId,
      storyId,
      chapterId,
      lastRead: new Date()
    });
  }

  static async saveProgressToDatabase(ReadingProgressModel) {
    for (const [key, progress] of this.progressMap.entries()) {
      try {
        await ReadingProgressModel.findOneAndUpdate(
          { userId: progress.userId, storyId: progress.storyId },
          progress,
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('Error saving reading progress:', error);
      }
    }
    console.log('Reading progress saved to database');
  }
}
```

### Lợi ích
- **Loose coupling**: Đối tượng subject không cần biết chi tiết về observers
- **Broadcast communication**: Một subject có thể thông báo cho nhiều observers
- **Dễ mở rộng**: Dễ dàng thêm observers mới mà không cần sửa đổi subject

## 6. Decorator Pattern

### Mô tả
Decorator Pattern cho phép thêm hành vi mới vào đối tượng hiện có mà không làm thay đổi cấu trúc của nó.

### Hiện thực trong dự án
GenreWithCountDecorator sử dụng Decorator Pattern để thêm thông tin số lượng truyện vào đối tượng Genre:

```javascript
// BasicGenre.js
class BasicGenre {
  constructor(genre) {
    this.id = genre._id;
    this.name = genre.name;
  }

  getName() {
    return this.name;
  }
}

// GenreWithCountDecorator.js
class GenreWithCountDecorator {
  constructor(genre) {
    this.genre = genre;
    this.storyCount = 0;
  }

  getName() {
    return `${this.genre.getName()} (${this.storyCount})`;
  }

  setStoryCount(count) {
    this.storyCount = count;
    return this;
  }
}
```

### Lợi ích
- **Mở rộng chức năng**: Thêm chức năng mới cho đối tượng mà không sửa đổi code gốc
- **Linh hoạt**: Có thể thêm hoặc bỏ decorator tùy ý
- **Tách biệt mối quan tâm**: Mỗi decorator chỉ xử lý một chức năng cụ thể

## 7. Repository Pattern

### Mô tả
Repository Pattern tách biệt logic truy cập dữ liệu khỏi logic nghiệp vụ, cung cấp một giao diện trung gian giữa domain model và data mapping layer.

### Hiện thực trong dự án
Các controller trong dự án sử dụng Repository Pattern để tương tác với database:

```javascript
// storyController.js
const getStories = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'latest' } = req.query;
    const skip = (page - 1) * limit;

    let sortOption = {};
    if (sort === 'popular') {
      sortOption = { views: -1 };
    } else if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    }

    const stories = await Story.find()
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title author genre thumbnail views status type');

    const total = await Story.countDocuments();

    res.json({
      stories,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### Lợi ích
- **Tách biệt mối quan tâm**: Tách biệt logic truy cập dữ liệu khỏi logic nghiệp vụ
- **Dễ test**: Dễ dàng mock repository để test logic nghiệp vụ
- **Dễ thay đổi**: Có thể thay đổi data source mà không ảnh hưởng đến logic nghiệp vụ
