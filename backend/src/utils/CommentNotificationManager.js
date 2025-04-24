/**
 * CommentNotificationManager - Quản lý thông báo bình luận sử dụng Observer Pattern
 */
class CommentNotificationManager {
  constructor() {
    this.observers = [];
    this.notifications = new Map();
  }

  // Đăng ký observer
  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      return true;
    }
    return false;
  }

  // Hủy đăng ký observer
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  // Thông báo cho tất cả observers
  notify(comment) {
    this.observers.forEach(observer => {
      if (observer.userId !== comment.user.toString()) {
        observer.update(comment);
      }
    });
  }

  // Thêm thông báo mới
  addNotification(userId, notification) {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId).push({
      ...notification,
      read: false,
      createdAt: new Date()
    });
  }

  // Lấy tất cả thông báo của một người dùng
  getNotifications(userId) {
    return this.notifications.get(userId) || [];
  }

  // Đánh dấu thông báo đã đọc
  markAsRead(userId, notificationId) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return true;
      }
    }
    return false;
  }

  // Xóa thông báo
  removeNotification(userId, notificationId) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      this.notifications.set(
        userId,
        userNotifications.filter(n => n.id !== notificationId)
      );
      return true;
    }
    return false;
  }
}

// Singleton instance
const commentNotificationManager = new CommentNotificationManager();

module.exports = commentNotificationManager;
