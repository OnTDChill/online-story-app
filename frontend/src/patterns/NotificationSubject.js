/**
 * NotificationSubject - Lớp chủ thể quản lý và gửi thông báo
 * Triển khai Observer Pattern
 */
class NotificationSubject {
  constructor() {
    this.observers = new Map(); // Map lưu trữ observers theo userId
  }

  /**
   * Đăng ký một observer mới
   * @param {string} userId - ID của người dùng
   * @param {Object} observer - Observer cần đăng ký
   */
  subscribe(userId, observer) {
    this.observers.set(userId, observer);
    console.log(`Observer cho người dùng ${userId} đã được đăng ký`);
    return this;
  }

  /**
   * Hủy đăng ký một observer
   * @param {string} userId - ID của người dùng
   */
  unsubscribe(userId) {
    const result = this.observers.delete(userId);
    if (result) {
      console.log(`Observer cho người dùng ${userId} đã được hủy đăng ký`);
    }
    return result;
  }

  /**
   * Thông báo cho tất cả observers về một sự kiện mới
   * @param {Object} notification - Thông báo cần gửi
   */
  notify(notification) {
    console.log(`Đang gửi thông báo: ${notification.message}`);
    
    for (const [userId, observer] of this.observers.entries()) {
      // Không gửi thông báo cho người tạo ra thông báo
      if (userId !== notification.sourceUserId) {
        observer.update(notification);
      }
    }
  }

  /**
   * Thông báo cho một observer cụ thể
   * @param {string} userId - ID của người dùng cần nhận thông báo
   * @param {Object} notification - Thông báo cần gửi
   */
  notifyOne(userId, notification) {
    const observer = this.observers.get(userId);
    if (observer) {
      console.log(`Đang gửi thông báo cho người dùng ${userId}: ${notification.message}`);
      observer.update(notification);
      return true;
    }
    return false;
  }

  /**
   * Lấy danh sách tất cả observers
   * @returns {Map} Map các observers
   */
  getObservers() {
    return this.observers;
  }
}

// Tạo một instance duy nhất (Singleton)
const notificationSubject = new NotificationSubject();

export default notificationSubject;
