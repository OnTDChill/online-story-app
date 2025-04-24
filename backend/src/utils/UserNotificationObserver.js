/**
 * UserNotificationObserver - Observer cho thông báo người dùng
 * Triển khai Observer Pattern
 */
class UserNotificationObserver {
  constructor(userId, username) {
    this.userId = userId;
    this.username = username;
    this.notifications = [];
  }

  // Phương thức được gọi khi có thông báo mới
  update(comment) {
    // Kiểm tra xem comment có liên quan đến người dùng không
    const isRelevant = this.isCommentRelevant(comment);
    
    if (isRelevant) {
      const notification = {
        id: Date.now().toString(),
        type: 'comment',
        commentId: comment._id,
        storyId: comment.story,
        chapterId: comment.chapter,
        message: `${comment.user.username} đã bình luận về truyện bạn đang theo dõi`,
        createdAt: new Date(),
        read: false
      };
      
      this.notifications.push(notification);
      return notification;
    }
    
    return null;
  }

  // Kiểm tra xem comment có liên quan đến người dùng không
  isCommentRelevant(comment) {
    // Trong thực tế, bạn sẽ kiểm tra xem người dùng có đang theo dõi truyện này không
    // Hoặc comment có phải là trả lời cho comment của người dùng không
    // Đây chỉ là triển khai đơn giản
    return true;
  }

  // Lấy tất cả thông báo
  getNotifications() {
    return this.notifications;
  }

  // Đánh dấu thông báo đã đọc
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  // Xóa thông báo
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }
}

module.exports = UserNotificationObserver;
