# Online Story App

## Giới thiệu
Online Story App là một nền tảng đọc truyện trực tuyến với nhiều tính năng phong phú, cho phép người dùng đọc, quản lý và tương tác với các tác phẩm truyện. Ứng dụng được xây dựng với Node.js, Express, MongoDB cho backend và React cho frontend.

## Chức năng chính

### 1. Hệ thống xác thực người dùng
- **Đăng ký**: Người dùng có thể tạo tài khoản mới với email, tên người dùng và mật khẩu
- **Đăng nhập**: Người dùng đã đăng ký có thể đăng nhập vào hệ thống
- **Phân quyền**: Hệ thống phân biệt vai trò Admin và Member với các quyền khác nhau

### 2. Quản lý truyện
- **Xem danh sách truyện**: Hiển thị danh sách truyện với các bộ lọc và sắp xếp
- **Xem chi tiết truyện**: Hiển thị thông tin chi tiết về truyện và danh sách chương
- **Thêm truyện mới**: Admin có thể thêm truyện mới vào hệ thống
- **Cập nhật truyện**: Admin có thể cập nhật thông tin truyện
- **Xóa truyện**: Admin có thể xóa truyện khỏi hệ thống

### 3. Đọc truyện
- **Đọc chương truyện**: Người dùng có thể đọc từng chương của truyện
- **Lưu tiến độ đọc**: Hệ thống tự động lưu tiến độ đọc của người dùng
- **Chuyển chương**: Người dùng có thể dễ dàng chuyển giữa các chương

### 4. Hệ thống thể loại
- **Phân loại truyện**: Truyện được phân loại theo thể loại
- **Lọc theo thể loại**: Người dùng có thể lọc truyện theo thể loại

### 5. Hệ thống tài chính
- **Diamonds và Rubies**: Người dùng có thể sử dụng tiền ảo để mua truyện VIP
- **Quản lý giao dịch**: Hệ thống theo dõi và quản lý các giao dịch

### 6. Trang quản trị Admin
- **Quản lý người dùng**: Admin có thể xem và quản lý thông tin người dùng
- **Quản lý truyện**: Admin có thể quản lý tất cả truyện trong hệ thống
- **Báo cáo doanh thu**: Admin có thể xem báo cáo doanh thu theo ngày/tháng/năm

## Công nghệ sử dụng
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, Material-UI
- **Xác thực**: JWT (JSON Web Tokens)
- **Lưu trữ file**: Multer

## Mẫu thiết kế (Design Patterns)
Dự án áp dụng nhiều mẫu thiết kế để tạo ra cấu trúc code rõ ràng, dễ bảo trì và mở rộng:

1. **Middleware Pattern**: Sử dụng trong Express để xử lý request
2. **Module Pattern**: Tổ chức code thành các module riêng biệt
3. **Factory Pattern**: Sử dụng trong việc tạo đối tượng Story, Chapter
4. **Singleton Pattern**: Áp dụng cho kết nối database
5. **Observer Pattern**: Sử dụng trong ReadingProgressManager
6. **Decorator Pattern**: Áp dụng cho GenreWithCountDecorator
7. **Strategy Pattern**: Sử dụng cho các chiến lược lọc truyện
8. **Repository Pattern**: Tách biệt logic truy cập dữ liệu

## Cài đặt và chạy dự án

### Yêu cầu
- Node.js (v14 trở lên)
- MongoDB
- npm hoặc yarn

### Cài đặt
1. Clone repository:
```
git clone https://github.com/OnTDChill/online-story-app.git
cd online-story-app
```

2. Cài đặt dependencies cho backend:
```
cd backend
npm install
```

3. Cài đặt dependencies cho frontend:
```
cd ../frontend
npm install
```

4. Tạo file .env trong thư mục backend với nội dung:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-story-app
JWT_SECRET=your_jwt_secret
```

### Chạy dự án
1. Chạy backend:
```
cd backend
npm start
```

2. Chạy frontend (trong terminal khác):
```
cd frontend
npm start
```

3. Truy cập ứng dụng tại: http://localhost:3000

## Tài khoản Admin mặc định
- Email: admin@example.com
- Password: admin123
