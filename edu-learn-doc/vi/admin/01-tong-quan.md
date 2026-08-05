# Tổng quan Admin Dashboard

## Giới thiệu

Admin Dashboard là giao diện quản trị trung tâm của EduLearn, cho phép người quản trị kiểm soát toàn bộ hoạt động của nền tảng.

## Đăng nhập Admin

1. Truy cập `/admin`
2. Nhập email và mật khẩu tài khoản Admin
3. Hệ thống chuyển hướng tới Dashboard

> **Lưu ý**: Chỉ tài khoản có vai trò `MANAGER` (Quản lý) hoặc `STAFF` (Nhân viên) mới có thể truy cập khu vực này.

## Cấu trúc Dashboard

### Thanh điều hướng (Sidebar)

- **Tổng quan** – Thống kê doanh số, học viên (Manager và Staff)
- **Khóa học** – Quản lý và biên tập nội dung khóa học (Manager và Staff)
- **Danh mục** – Quản lý danh mục chuyên đề (Manager và Staff)
- **Combo** – Tạo các combo khóa học giảm giá (Manager và Staff)
- **Người dùng** – Quản lý tài khoản khách hàng (**Chỉ dành cho MANAGER**, Staff bị ẩn)
- **Đơn hàng** – Quản lý trạng thái giao dịch, kích hoạt đơn (Manager và Staff)
- **Mã giảm giá** – Quản lý các mã coupon ưu đãi (Manager và Staff)
- **Thanh toán** – Quản lý cấu hình phương thức nhận tiền (Manager và Staff)
- **Nội dung website** – CMS các trang tĩnh, FAQ, chính sách (Manager và Staff)
- **Cài đặt website** – Thay đổi Logo, tên thương hiệu, màu sắc (Manager và Staff)
- **Tài liệu hướng dẫn CTV** – Quản lý tài liệu và điều khoản CTV (Manager và Staff)
- **Bài viết & Blog** – Viết bài chia sẻ kinh nghiệm học tập (Manager và Staff)
- **Affiliate** – Quản lý danh sách cộng tác viên tiếp thị liên kết (Manager và Staff)
- **Doanh thu Affiliate** – Thống kê đơn hàng giới thiệu (Manager và Staff)
- **Thống kê doanh thu CTV** – Xem báo cáo hoa hồng (Manager và Staff)
- **Thanh toán rút tiền** – Quản lý lệnh rút tiền hoa hồng của CTV (Manager và Staff)
- **Tài khoản Quản trị** – Quản lý phân quyền tài khoản quản trị hệ thống (**Chỉ dành for MANAGER**, Staff bị ẩn)
- **Tài khoản của tôi** – Chỉnh sửa thông tin cá nhân

### Thẻ thống kê (KPI Cards)

Trang Dashboard hiển thị các chỉ số:
| Chỉ số | Mô tả |
|--------|-------|
| Tổng doanh thu | Tổng doanh thu từ tất cả đơn hàng thành công |
| Số đơn hàng | Số lượng đơn hàng trong kỳ |
| Người dùng mới | Số tài khoản đăng ký mới |
| Khóa học đang bán | Số khóa học đang hoạt động |

## Vai trò người dùng

| Vai trò     | Quyền hạn                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MANAGER`   | **Quản lý (Admin)**: Toàn quyền quản trị hệ thống, dữ liệu tài khoản, phân quyền.                                                                                                                           |
| `STAFF`     | **Nhân viên**: Hỗ trợ vận hành các tính năng kinh doanh (khoá học, combo, mã giảm giá, bài viết, phê duyệt đơn hàng, thanh toán rút tiền). Bị hạn chế quyền xem thông tin Người dùng và Tài khoản Quản trị. |
| `USER`      | **Học viên**: Mua khóa học, thanh toán, học trực tuyến.                                                                                                                                                     |
| `AFFILIATE` | **Cộng tác viên**: Tham gia tiếp thị liên kết, nhận hoa hồng.                                                                                                                                               |
