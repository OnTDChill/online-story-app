/**
 * UserNotificationObserver - Lớp observer cho thông báo người dùng
 * Triển khai Observer Pattern
 */
class UserNotificationObserver {
  /**
   * Khởi tạo observer cho một người dùng
   * @param {string} userId - ID của người dùng
   * @param {string} username - Tên người dùng
   */
  constructor(userId, username) {
    this.userId = userId;
    this.username = username;
    this.notifications = [];
  }

  /**
   * Cập nhật khi nhận được thông báo mới
   * @param {Object} notification - Thông báo nhận được
   */
  update(notification) {
    console.log(`Observer của ${this.username} nhận được thông báo: ${notification.message}`);
    
    // Thêm thông báo vào danh sách với trạng thái chưa đọc
    const newNotification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      read: false,
      receivedAt: new Date()
    };
    
    this.notifications.push(newNotification);
    
    // Có thể thêm logic để hiển thị thông báo trên UI ở đây
    this.displayNotification(newNotification);
    
    return newNotification;
  }

  /**
   * Hiển thị thông báo trên UI
   * @param {Object} notification - Thông báo cần hiển thị
   */
  displayNotification(notification) {
    // Triển khai logic hiển thị thông báo (có thể sử dụng toast, popup, v.v.)
    console.log(`Hiển thị thông báo cho ${this.username}: ${notification.message}`);
  }

  /**
   * Lấy tất cả thông báo
   * @returns {Array} Danh sách thông báo
   */
  getNotifications() {
    return this.notifications;
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   * @returns {number} Số lượng thông báo chưa đọc
   */
  getUnreadCount() {
    return this.notifications.filter(notification => !notification.read).length;
  }

  /**
   * Đánh dấu thông báo đã đọc
   * @param {string} notificationId - ID của thông báo
   * @returns {boolean} Kết quả đánh dấu
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }

  /**
   * Xóa thông báo
   * @param {string} notificationId - ID của thông báo
   * @returns {boolean} Kết quả xóa
   */
  removeNotification(notificationId) {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    return this.notifications.length < initialLength;
  }

  /**
   * Xóa tất cả thông báo
   */
  clearNotifications() {
    this.notifications = [];
  }
}

export default UserNotificationObserver;
