# Tài liệu phân tích mẫu thiết kế trong Online Story App

## Giới thiệu

Tài liệu này mô tả chi tiết các mẫu thiết kế (design patterns) đã được triển khai trong dự án Online Story App. Mỗi mẫu thiết kế được phân tích về cấu trúc, cách triển khai và lợi ích mang lại.

## 1. Template Method Pattern

### Mô tả
Template Method Pattern định nghĩa khung của một thuật toán trong một phương thức, hoãn một số bước cho các lớp con triển khai. Mẫu này cho phép lớp con định nghĩa lại một số bước của thuật toán mà không thay đổi cấu trúc thuật toán.

### Triển khai trong dự án
Trong dự án, Template Method Pattern được sử dụng để xuất dữ liệu theo nhiều định dạng khác nhau (CSV, Excel, PDF).

#### Cấu trúc
- **Lớp cơ sở (DataExporter)**: Định nghĩa khung thuật toán xuất dữ liệu với các bước cụ thể.
- **Lớp con (CSVExporter, ExcelExporter, PDFExporter)**: Triển khai các bước trừu tượng của thuật toán.

#### File liên quan
- `frontend/src/patterns/DataExporter.js`: Lớp cơ sở định nghĩa khung thuật toán.
- `frontend/src/patterns/CSVExporter.js`: Lớp con xuất dữ liệu sang định dạng CSV.
- `frontend/src/patterns/ExcelExporter.js`: Lớp con xuất dữ liệu sang định dạng Excel.
- `frontend/src/patterns/PDFExporter.js`: Lớp con xuất dữ liệu sang định dạng PDF.
- `frontend/src/components/admin/RevenueExport.jsx`: Component sử dụng các lớp xuất dữ liệu.

#### Luồng hoạt động
1. Component `RevenueExport` tạo đối tượng exporter tương ứng với định dạng xuất.
2. Gọi phương thức `export()` của exporter.
3. Phương thức `export()` thực hiện các bước theo thứ tự:
   - `prepareData()`: Chuẩn bị dữ liệu (bước chung)
   - `formatData()`: Định dạng dữ liệu (bước trừu tượng, do lớp con triển khai)
   - `saveData()`: Lưu dữ liệu (bước trừu tượng, do lớp con triển khai)
   - `completeExport()`: Hoàn thành xuất dữ liệu (bước chung)

#### Lợi ích
- **Tái sử dụng code**: Các bước chung được định nghĩa một lần trong lớp cơ sở.
- **Mở rộng dễ dàng**: Dễ dàng thêm định dạng xuất mới bằng cách tạo lớp con mới.
- **Tách biệt trách nhiệm**: Mỗi lớp con chỉ tập trung vào việc triển khai các bước cụ thể.

## 2. Observer Pattern

### Mô tả
Observer Pattern định nghĩa một sự phụ thuộc một-nhiều giữa các đối tượng, khi một đối tượng thay đổi trạng thái, tất cả các đối tượng phụ thuộc sẽ được thông báo và cập nhật tự động.

### Triển khai trong dự án
Trong dự án, Observer Pattern được sử dụng để xây dựng hệ thống thông báo, cho phép người dùng nhận thông báo khi có sự kiện mới.

#### Cấu trúc
- **Subject (NotificationSubject)**: Quản lý và thông báo cho các observers.
- **Observer (UserNotificationObserver)**: Nhận và xử lý thông báo.
- **Context (NotificationContext)**: Cung cấp giao diện sử dụng hệ thống thông báo.

#### File liên quan
- `frontend/src/patterns/NotificationSubject.js`: Lớp chủ thể quản lý và gửi thông báo.
- `frontend/src/patterns/UserNotificationObserver.js`: Lớp observer nhận và xử lý thông báo.
- `frontend/src/context/NotificationContext.js`: Context cung cấp giao diện sử dụng hệ thống thông báo.
- `frontend/src/components/notification/NotificationList.jsx`: Component hiển thị danh sách thông báo.

#### Luồng hoạt động
1. `NotificationSubject` duy trì danh sách các observers.
2. Khi có sự kiện mới, `NotificationSubject` gọi phương thức `notify()` để thông báo cho tất cả observers.
3. Mỗi `UserNotificationObserver` nhận thông báo và cập nhật trạng thái thông qua phương thức `update()`.
4. `NotificationContext` cung cấp giao diện để component `NotificationList` có thể tương tác với hệ thống thông báo.

#### Lợi ích
- **Loose coupling**: Subject không cần biết chi tiết về observers.
- **Broadcast communication**: Một subject có thể thông báo cho nhiều observers.
- **Dễ mở rộng**: Dễ dàng thêm loại thông báo mới mà không cần sửa đổi code hiện có.

## 3. Strategy Pattern

### Mô tả
Strategy Pattern định nghĩa một họ các thuật toán, đóng gói mỗi thuật toán và làm cho chúng có thể hoán đổi cho nhau. Mẫu này cho phép thuật toán thay đổi độc lập với client sử dụng nó.

### Triển khai trong dự án
Trong dự án, Strategy Pattern được sử dụng để xây dựng hệ thống lọc truyện nâng cao, cho phép người dùng lọc truyện theo nhiều tiêu chí khác nhau.

#### Cấu trúc
- **Strategy (StoryFilterStrategy)**: Định nghĩa giao diện chung cho tất cả các thuật toán lọc.
- **ConcreteStrategy (GenreFilterStrategy, StatusFilterStrategy, ...)**: Triển khai cụ thể các thuật toán lọc.
- **Context (StoryFilterContext)**: Sử dụng các thuật toán lọc.

#### File liên quan
- `frontend/src/patterns/StoryFilterStrategy.js`: Lớp cơ sở và các lớp con triển khai các chiến lược lọc.
- `frontend/src/patterns/StoryFilterContext.js`: Lớp ngữ cảnh sử dụng các chiến lược lọc.
- `frontend/src/components/story/AdvancedFilter.jsx`: Component sử dụng hệ thống lọc truyện nâng cao.

#### Luồng hoạt động
1. Component `AdvancedFilter` tạo đối tượng `StoryFilterContext`.
2. Thêm các chiến lược lọc vào context dựa trên tiêu chí người dùng chọn.
3. Gọi phương thức `executeFilter()` của context để thực hiện lọc.
4. Mỗi chiến lược lọc được áp dụng lần lượt thông qua phương thức `filter()`.

#### Lợi ích
- **Tách biệt logic lọc**: Mỗi chiến lược lọc được tách biệt thành một lớp riêng.
- **Dễ mở rộng**: Dễ dàng thêm chiến lược lọc mới mà không cần sửa đổi code hiện có.
- **Linh hoạt**: Có thể kết hợp nhiều chiến lược lọc khác nhau.

## 4. Decorator Pattern

### Mô tả
Decorator Pattern cho phép thêm hành vi mới vào đối tượng hiện có mà không làm thay đổi cấu trúc của nó. Mẫu này tạo ra một lớp decorator bọc đối tượng gốc và cung cấp chức năng bổ sung.

### Triển khai trong dự án
Trong dự án, Decorator Pattern được sử dụng để hiển thị thể loại truyện với nhiều thông tin bổ sung như số lượng truyện và độ phổ biến.

#### Cấu trúc
- **Component (BasicGenre)**: Định nghĩa giao diện cho đối tượng có thể được trang trí.
- **Decorator (GenreWithCountDecorator, GenreWithPopularityDecorator)**: Duy trì tham chiếu đến đối tượng Component và định nghĩa giao diện phù hợp với giao diện Component.

#### File liên quan
- `frontend/src/patterns/GenreDecorator.js`: Định nghĩa lớp cơ sở và các decorator.
- `frontend/src/components/genre/GenreList.jsx`: Component sử dụng các decorator để hiển thị thể loại.

#### Luồng hoạt động
1. Component `GenreList` tạo đối tượng `BasicGenre` cho mỗi thể loại.
2. Tùy thuộc vào chế độ hiển thị, component trang trí đối tượng `BasicGenre` với các decorator khác nhau.
3. Gọi phương thức `getName()` của đối tượng đã được trang trí để hiển thị tên thể loại với thông tin bổ sung.

#### Lợi ích
- **Mở rộng chức năng**: Thêm chức năng mới cho đối tượng mà không sửa đổi code gốc.
- **Linh hoạt**: Có thể thêm hoặc bỏ decorator tùy ý.
- **Tách biệt mối quan tâm**: Mỗi decorator chỉ xử lý một chức năng cụ thể.

## Kết luận

Việc áp dụng các mẫu thiết kế trong dự án Online Story App đã giúp cải thiện đáng kể cấu trúc code, tăng tính mở rộng và dễ bảo trì. Mỗi mẫu thiết kế giải quyết một vấn đề cụ thể và mang lại những lợi ích riêng:

- **Template Method Pattern**: Giúp tái sử dụng code và dễ dàng mở rộng chức năng xuất dữ liệu.
- **Observer Pattern**: Xây dựng hệ thống thông báo linh hoạt và dễ mở rộng.
- **Strategy Pattern**: Tạo hệ thống lọc truyện linh hoạt và dễ mở rộng.
- **Decorator Pattern**: Cho phép hiển thị thể loại với nhiều thông tin bổ sung mà không làm thay đổi cấu trúc cơ bản.

Các mẫu thiết kế này không chỉ giúp cải thiện chất lượng code mà còn giúp đáp ứng các yêu cầu của rubric đánh giá, đặc biệt là phần "Hiện thực mẫu" và "Chỉnh sửa chức năng trên mẫu thiết kế".
