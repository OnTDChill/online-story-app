import React, { useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';

/**
 * Component hiển thị danh sách thông báo
 * Sử dụng Observer Pattern thông qua NotificationContext
 */
const NotificationList = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    createNotification // Chỉ để test
  } = useNotifications();

  // Tạo thông báo mẫu để test
  useEffect(() => {
    // Chỉ tạo thông báo mẫu nếu không có thông báo nào
    if (notifications.length === 0) {
      // Tạo một số thông báo mẫu
      setTimeout(() => {
        createNotification({
          type: 'comment',
          message: 'Người dùng A đã bình luận về truyện của bạn',
          data: { storyId: 'story-1', commentId: 'comment-1' }
        });
        
        setTimeout(() => {
          createNotification({
            type: 'like',
            message: 'Người dùng B đã thích truyện của bạn',
            data: { storyId: 'story-2' }
          });
          
          setTimeout(() => {
            createNotification({
              type: 'system',
              message: 'Hệ thống đã cập nhật chính sách bảo mật',
              data: { url: '/privacy-policy' }
            });
          }, 1000);
        }, 1000);
      }, 1000);
    }
  }, [notifications.length, createNotification]);

  // Định dạng thời gian
  const formatTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Vừa xong';
    } else if (diffMin < 60) {
      return `${diffMin} phút trước`;
    } else if (diffHour < 24) {
      return `${diffHour} giờ trước`;
    } else if (diffDay < 30) {
      return `${diffDay} ngày trước`;
    } else {
      return notificationDate.toLocaleDateString('vi-VN');
    }
  };

  // Lấy icon cho loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      case 'follow':
        return '👤';
      case 'system':
        return '🔔';
      default:
        return '📩';
    }
  };

  // Xử lý khi click vào thông báo
  const handleNotificationClick = (notification) => {
    // Đánh dấu thông báo đã đọc
    markAsRead(notification.id);
    
    // Xử lý hành động dựa trên loại thông báo
    switch (notification.type) {
      case 'comment':
        // Chuyển hướng đến trang bình luận
        console.log(`Chuyển hướng đến bình luận: ${notification.data?.commentId}`);
        break;
      case 'like':
        // Chuyển hướng đến trang truyện
        console.log(`Chuyển hướng đến truyện: ${notification.data?.storyId}`);
        break;
      case 'system':
        // Chuyển hướng đến URL trong thông báo
        if (notification.data?.url) {
          console.log(`Chuyển hướng đến: ${notification.data.url}`);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Thông báo</h2>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} mới
              </span>
            )}
            
            <button
              onClick={markAllAsRead}
              className="text-blue-500 hover:text-blue-700 text-sm"
              disabled={unreadCount === 0}
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer flex items-start ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mr-3 text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.message}
                    </p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.createdAt || notification.receivedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
