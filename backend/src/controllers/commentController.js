const Comment = require('../models/Comment');
const Story = require('../models/Story');
const User = require('../models/User');
const commentNotificationManager = require('../utils/CommentNotificationManager');
const UserNotificationObserver = require('../utils/UserNotificationObserver');

// Tạo bình luận mới
const createComment = async (req, res) => {
  try {
    const { storyId, chapterId, content } = req.body;
    const userId = req.user.user.id;

    // Kiểm tra story có tồn tại không
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Tạo comment mới
    const newComment = new Comment({
      user: userId,
      story: storyId,
      chapter: chapterId || null,
      content
    });

    // Lưu comment
    await newComment.save();

    // Populate thông tin user
    const populatedComment = await Comment.findById(newComment._id).populate('user', 'username avatar');

    // Thông báo cho các observers
    commentNotificationManager.notify(populatedComment);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy tất cả bình luận của một truyện
const getCommentsByStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Lấy comments
    const comments = await Comment.find({ story: storyId, chapter: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar')
      .populate({
        path: 'replies.user',
        select: 'username avatar'
      });

    // Đếm tổng số comments
    const total = await Comment.countDocuments({ story: storyId, chapter: null });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy tất cả bình luận của một chương
const getCommentsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Lấy comments
    const comments = await Comment.find({ chapter: chapterId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar')
      .populate({
        path: 'replies.user',
        select: 'username avatar'
      });

    // Đếm tổng số comments
    const total = await Comment.countDocuments({ chapter: chapterId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Thêm reply vào comment
const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.user.id;

    // Tìm comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Lấy thông tin user
    const user = await User.findById(userId).select('username avatar');

    // Thêm reply
    comment.replies.push({
      user: userId,
      content
    });

    // Lưu comment
    await comment.save();

    // Populate thông tin user cho reply mới
    const updatedComment = await Comment.findById(commentId)
      .populate('user', 'username avatar')
      .populate({
        path: 'replies.user',
        select: 'username avatar'
      });

    // Thông báo cho chủ comment
    if (comment.user.toString() !== userId) {
      const commentOwner = await User.findById(comment.user);
      if (commentOwner) {
        // Tạo observer nếu chưa có
        const observer = new UserNotificationObserver(comment.user.toString(), commentOwner.username);
        commentNotificationManager.subscribe(observer);
        
        // Tạo thông báo
        const notification = {
          id: Date.now().toString(),
          type: 'reply',
          commentId: comment._id,
          storyId: comment.story,
          chapterId: comment.chapter,
          message: `${user.username} đã trả lời bình luận của bạn`,
          createdAt: new Date()
        };
        
        commentNotificationManager.addNotification(comment.user.toString(), notification);
      }
    }

    res.json({
      message: 'Reply added successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like comment
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.user.id;

    // Tìm comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Kiểm tra xem user đã like chưa
    const alreadyLiked = comment.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      comment.likes.push(userId);
      
      // Thông báo cho chủ comment
      if (comment.user.toString() !== userId) {
        const user = await User.findById(userId).select('username');
        const commentOwner = await User.findById(comment.user);
        
        if (commentOwner) {
          // Tạo observer nếu chưa có
          const observer = new UserNotificationObserver(comment.user.toString(), commentOwner.username);
          commentNotificationManager.subscribe(observer);
          
          // Tạo thông báo
          const notification = {
            id: Date.now().toString(),
            type: 'like',
            commentId: comment._id,
            storyId: comment.story,
            chapterId: comment.chapter,
            message: `${user.username} đã thích bình luận của bạn`,
            createdAt: new Date()
          };
          
          commentNotificationManager.addNotification(comment.user.toString(), notification);
        }
      }
    }

    // Lưu comment
    await comment.save();

    res.json({
      message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes.length
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy thông báo của người dùng
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    // Lấy thông báo từ manager
    const notifications = commentNotificationManager.getNotifications(userId);
    
    res.json({
      notifications: notifications.sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Đánh dấu thông báo đã đọc
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { notificationId } = req.params;
    
    // Đánh dấu đã đọc
    const success = commentNotificationManager.markAsRead(userId, notificationId);
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComment,
  getCommentsByStory,
  getCommentsByChapter,
  addReply,
  likeComment,
  getUserNotifications,
  markNotificationAsRead
};
