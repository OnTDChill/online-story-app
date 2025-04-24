import React, { createContext, useContext, useEffect, useState } from 'react';
import notificationSubject from '../patterns/NotificationSubject';
import UserNotificationObserver from '../patterns/UserNotificationObserver';

// Tạo context
const NotificationContext = createContext();

/**
 * Hook tùy chỉnh để sử dụng NotificationContext
 * @returns {Object} Context value
 */
export const useNotifications = () => useContext(NotificationContext);

/**
 * Provider cho NotificationContext
 * @param {Object} props - Props của component
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [observer, setObserver] = useState(null);
  const [user, setUser] = useState(null);

  // Khởi tạo observer khi user thay đổi
  useEffect(() => {
    // Lấy thông tin user từ localStorage hoặc context khác
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (userInfo) {
      setUser(userInfo);
      
      // Tạo observer mới
      const newObserver = new UserNotificationObserver(
        userInfo._id,
        userInfo.username
      );
      
      // Đăng ký observer với subject
      notificationSubject.subscribe(userInfo._id, newObserver);
      
      // Lưu observer vào state
      setObserver(newObserver);
      
      // Cleanup khi component unmount
      return () => {
        if (userInfo._id) {
          notificationSubject.unsubscribe(userInfo._id);
        }
      };
    }
  }, []);

  // Cập nhật notifications khi observer thay đổi
  useEffect(() => {
    if (observer) {
      // Hàm cập nhật notifications từ observer
      const updateNotifications = () => {
        const allNotifications = observer.getNotifications();
        setNotifications(allNotifications);
        setUnreadCount(observer.getUnreadCount());
      };
      
      // Thiết lập interval để cập nhật notifications định kỳ
      const intervalId = setInterval(updateNotifications, 5000);
      
      // Cập nhật ngay lập tức
      updateNotifications();
      
      // Cleanup khi component unmount
      return () => clearInterval(intervalId);
    }
  }, [observer]);

  /**
   * Đánh dấu thông báo đã đọc
   * @param {string} notificationId - ID của thông báo
   */
  const markAsRead = (notificationId) => {
    if (observer && observer.markAsRead(notificationId)) {
      // Cập nhật state
      setNotifications([...observer.getNotifications()]);
      setUnreadCount(observer.getUnreadCount());
    }
  };

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  const markAllAsRead = () => {
    if (observer) {
      observer.markAllAsRead();
      // Cập nhật state
      setNotifications([...observer.getNotifications()]);
      setUnreadCount(0);
    }
  };

  /**
   * Xóa thông báo
   * @param {string} notificationId - ID của thông báo
   */
  const removeNotification = (notificationId) => {
    if (observer && observer.removeNotification(notificationId)) {
      // Cập nhật state
      setNotifications([...observer.getNotifications()]);
      setUnreadCount(observer.getUnreadCount());
    }
  };

  /**
   * Tạo thông báo mới (để test)
   * @param {Object} notification - Thông báo cần tạo
   */
  const createNotification = (notification) => {
    if (user) {
      notificationSubject.notify({
        id: Date.now().toString(),
        sourceUserId: notification.sourceUserId || 'system',
        targetUserId: user._id,
        type: notification.type || 'info',
        message: notification.message,
        data: notification.data || {},
        createdAt: new Date()
      });
    }
  };

  // Giá trị context
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    createNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
