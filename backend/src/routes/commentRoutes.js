const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

// Tạo bình luận mới
router.post('/', authMiddleware, commentController.createComment);

// Lấy tất cả bình luận của một truyện
router.get('/story/:storyId', commentController.getCommentsByStory);

// Lấy tất cả bình luận của một chương
router.get('/chapter/:chapterId', commentController.getCommentsByChapter);

// Thêm reply vào comment
router.post('/:commentId/reply', authMiddleware, commentController.addReply);

// Like comment
router.post('/:commentId/like', authMiddleware, commentController.likeComment);

// Lấy thông báo của người dùng
router.get('/notifications', authMiddleware, commentController.getUserNotifications);

// Đánh dấu thông báo đã đọc
router.put('/notifications/:notificationId', authMiddleware, commentController.markNotificationAsRead);

module.exports = router;
