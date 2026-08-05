# Tài Liệu Đặc Tả Yêu Cầu Phần Mềm (Software Requirements Specification - SRS)

> **Dự án:** EduLearn - Nền tảng Học trực tuyến & Bán khóa học qua Google Drive  
> **Mã tài liệu:** SRS-EDULEARN-01  
> **Phiên bản:** 1.0.0  
> **Ngày phát hành:** 05/08/2026  
> **Tác giả:** Đội ngũ phát triển EduLearn  

---

## 1. Giới thiệu (Introduction)

### 1.1 Mục đích (Purpose)
Tài liệu SRS này mô tả đầy đủ và chi tiết các yêu cầu chức năng, phi chức năng, kiến trúc giao tiếp, dữ liệu và ràng buộc hệ thống cho dự án **EduLearn**. Tài liệu này phục vụ làm căn cứ chính thức cho quá trình phát triển (Development), kiểm thử (Testing), quản lý dự án (Project Management) và bảo trì sản phẩm.

### 1.2 Phạm vi sản phẩm (Product Scope)
**EduLearn** là hệ thống E-learning đa chức năng cho phép:
- **Học viên (User):** Tìm kiếm khóa học, mua khóa học/combo khóa học, thanh toán chuyển khoản ngân hàng (tải lên ảnh minh chứng), học trực tuyến video tích hợp qua Google Drive, tham gia chương trình Tiếp thị liên kết (Affiliate / Cộng tác viên), sử dụng mã giảm giá (Coupon), viết đánh giá khóa học.
- **Cộng tác viên (Affiliate / CTV):** Đăng ký tài khoản CTV, nhận link/mã giới thiệu (Mã CTV), theo dõi doanh thu hoa hồng tự động khi học viên mua qua link, tạo yêu cầu rút tiền về tài khoản ngân hàng cá nhân, nhận thông báo hoa hồng real-time/nội bộ.
- **Quản trị viên & Nhân viên (Admin / Manager / Staff):** Quản lý danh mục, khóa học, video/bài học, combo; duyệt và quản lý đơn hàng & xác nhận thanh toán; quản lý mã giảm giá; phê duyệt tài khoản CTV & yêu cầu rút tiền; quản lý trang tĩnh (Điều khoản, Hướng dẫn, Giới thiệu, FAQ), banner quảng cáo, cấu hình trang chủ & email SMTP; quản lý bài viết Blog.

### 1.3 Thuật ngữ & Từ viết tắt (Definitions & Acronyms)
| Thuật ngữ | Khái niệm / Giải thích |
|-----------|------------------------|
| **SRS** | Software Requirements Specification (Tài liệu đặc tả yêu cầu phần mềm) |
| **JWT** | JSON Web Token - Phương thức xác thực người dùng không lưu phiên phía server |
| **CTV / Affiliate** | Cộng tác viên tiếp thị liên kết bán khóa học nhận % hoa hồng |
| **Combo** | Gói tổng hợp nhiều khóa học bán với mức giá ưu đãi |
| **Proof of Payment** | Ảnh tải lên chứng minh học viên đã chuyển khoản thành công |

---

## 2. Mô tả tổng thể (Overall Description)

### 2.1 Bối cảnh sản phẩm (Product Perspective)
EduLearn là một hệ thống web độc lập dạng Monolith dựa trên kiến trúc:
- **Frontend Client:** Next.js 14 (App Router, TypeScript, Tailwind CSS).
- **Backend API:** Node.js Express.js RESTful API.
- **Database:** SQLite3 (Lưu trữ quan hệ nhẹ, tốc độ truy vấn cao).
- **Media Engine:** Lưu trữ & phát nội dung bài giảng video thông qua link nhúng Google Drive tối ưu hóa trình chiếu.

```
+-------------------------------------------------------------+
|                      EduLearn Web Application               |
|  +--------------------+             +--------------------+  |
|  | Next.js Frontend   | <---REST---> | Express Backend    |  |
|  +--------------------+             +---------+----------+  |
|                                               |             |
|                                       +-------v-------+     |
|                                       |   SQLite DB   |     |
|                                       +---------------+     |
+-------------------------------------------------------------+
```

### 2.2 Các phân hệ người dùng (User Classes & Characteristics)
Hệ thống phân quyền dựa trên thuộc tính `role` và bảng `affiliates`:

1. **Khách hàng chưa đăng nhập (Guest):** Xem danh mục khóa học, nội dung giới thiệu, đọc bài viết blog, tra cứu FAQ, xem combo, áp dụng thử mã giảm giá.
2. **Học viên (USER):** Đã đăng ký/đăng nhập. Mua khóa học, tải ảnh minh chứng chuyển khoản, học khóa học đã mở khóa, đánh giá bài học, gửi yêu cầu đăng ký CTV.
3. **Cộng tác viên (AFFILIATE):** Tài khoản đã được Admin phê duyệt làm CTV. Sở hữu mã CTV, link ref, xem báo cáo doanh số, hoa hồng từng khóa học, tạo yêu cầu rút tiền.
4. **Nhân viên / Quản lý (STAFF / MANAGER):** Quản lý khóa học, đơn hàng, duyệt thanh toán, phản hồi khách hàng.
5. **Quản trị viên (ADMIN):** Quyền hạn tối cao trên hệ thống: Cấu hình email SMTP, cấu hình trang chủ/banner, duyệt rút tiền CTV, quản lý tài khoản Admin/Manager/Staff, chỉnh sửa hoa hồng mặc định.

### 2.3 Ràng buộc hệ thống (Operating Constraints)
- Hệ thống hỗ trợ hiển thị responsive trên các thiết bị Desktop, Tablet và Smartphone.
- Đơn hàng chuyển khoản ngân hàng được kiểm tra và duyệt thủ công/bán tự động bởi Admin thông qua minh chứng thanh toán.
- Dữ liệu hình ảnh minh chứng và ảnh khóa học được upload trực tiếp vào thư mục `uploads/` trên server backend.

---

## 3. Yêu cầu Chức năng (Functional Requirements)

### 3.1 Phân hệ Xác thực & Tài khoản (Authentication & Account)
- **FR-AUTH-01:** Đăng ký tài khoản mới bằng Email, Mật khẩu, Họ tên và Số điện thoại.
- **FR-AUTH-02:** Đăng nhập hệ thống bằng Email và Mật khẩu, phản hồi bằng mã JSON Web Token (JWT).
- **FR-AUTH-03:** Đổi mật khẩu tài khoản và Đổi mật khẩu bắt buộc (`must_change_password`).
- **FR-AUTH-04:** Quên mật khẩu - Gửi mã/token khôi phục mật khẩu qua Email (sử dụng Nodemailer SMTP).
- **FR-AUTH-05:** Cập nhật thông tin cá nhân (Họ tên, Số điện thoại, Avatar).

### 3.2 Phân hệ Khóa học & Combo (Courses & Combos)
- **FR-CRS-01:** Quản lý Danh mục khóa học (Lập trình Web, UI/UX, Marketing, Data Science, v.v.).
- **FR-CRS-02:** Tạo/Sửa/Xóa khóa học (Tiêu đề, Mô tả, Ảnh đại diện, Giá gốc, Giá khuyến mãi, Giảng viên, Bài giảng Drive, HTML chi tiết, Highlights JSON, Chương trình học Curriculum JSON).
- **FR-CRS-03:** Quản lý Gói Combo (Gộp nhiều khóa học bán chung với mức giá ưu đãi).
- **FR-CRS-04:** Tìm kiếm, lọc khóa học theo danh mục, mức giá, từ khóa tìm kiếm.
- **FR-CRS-05:** Xem xem chi tiết khóa học, phát video demo công khai.

### 3.3 Phân hệ Giỏ hàng, Đơn hàng & Thanh toán (Cart, Order & Payment)
- **FR-ORD-01:** Thêm khóa học/combo vào giỏ hàng cá nhân.
- **FR-ORD-02:** Nhập và áp dụng Mã giảm giá (Coupon), kiểm tra điều kiện (Hạn sử dụng, Số lượng còn lại, Đơn hàng tối thiểu, Giảm tối đa).
- **FR-ORD-03:** Tạo đơn hàng mới với Phương thức thanh toán (Chuyển khoản ngân hàng / QR Code).
- **FR-ORD-04:** Học viên gửi Ảnh minh chứng thanh toán (`payment_proof`).
- **FR-ORD-05:** Admin/Manager kiểm tra ảnh minh chứng và cập nhật trạng thái đơn hàng (`completed` / `cancelled`) và trạng thái thanh toán (`da_thanh_toan`).
- **FR-ORD-06:** Hệ thống tự động mở khóa (Unlock) các khóa học nằm trong đơn hàng sau khi duyệt thanh toán thành công.

### 3.4 Phân hệ Tiếp thị liên kết (Affiliate System)
- **FR-AFF-01:** Đăng ký làm Cộng tác viên (Điền thông tin Ngân hàng, Số tài khoản, Chủ tài khoản, CCCD/SĐT).
- **FR-AFF-02:** Admin duyệt đơn đăng ký CTV và cấp Mã CTV (`ma_ctv` / `ctv_code`).
- **FR-AFF-03:** Lưu trữ thông tin Click giới thiệu (`affiliate_clicks`) khi học viên truy cập qua link ref `?ref=MA_CTV`.
- **FR-AFF-04:** Ghi nhận doanh thu hoa hồng tự động (`affiliate_revenues`) theo tỉ lệ phần trăm thiết lập cho từng khóa học (mặc định 15%).
- **FR-AFF-05:** CTV gửi Yêu cầu rút tiền (`withdrawal_requests`) khi đạt hạn mức tối thiểu.
- **FR-AFF-06:** Admin duyệt/từ chối yêu cầu rút tiền và cập nhật trạng thái tiền đã thanh toán.

### 3.5 Phân hệ Quản trị Nội dung & Cài đặt (CMS & System Settings)
- **FR-CMS-01:** Quản lý bài viết Blog & Danh mục tin tức.
- **FR-CMS-02:** Quản lý Banner khuyến mãi trang chủ (Ảnh, Tiêu đề, Link, Thứ tự hiển thị).
- **FR-CMS-03:** Quản lý nội dung trang tĩnh (Điều khoản dịch vụ, Hướng dẫn mua hàng, Giới thiệu, FAQ).
- **FR-CMS-04:** Cấu hình thông tin liên hệ và Banner trang chủ (Home Banner Settings, Thống kê học viên).
- **FR-CMS-05:** Cấu hình Email SMTP (Host, Port, User, Pass, Email gửi) để gửi mail thông báo đơn hàng và mật khẩu.

---

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)

### 4.1 Hiệu năng (Performance)
- Thời gian phản hồi API RESTful < 200ms cho các truy vấn dữ liệu chuẩn.
- Giao diện Next.js tối ưu hóa Server-Side Rendering (SSR) & Client Cache để tải trang dưới 1.5 giây.

### 4.2 Bảo mật (Security)
- Mật khẩu người dùng được mã hóa bằng thuật toán **Bcrypt** với Salt Rounds >= 10.
- Xác thực API thông qua Bearer Token (JWT) có thời hạn hết hạn.
- Phân quyền Middleware kiểm tra Role nghiêm ngặt (`verifyToken`, `verifyAdmin`, `verifyStaffOrAdmin`).
- Lọc file upload chỉ cho phép định dạng ảnh (`png`, `jpg`, `jpeg`, `webp`) và giới hạn kích thước file <= 5MB.

### 4.3 Khả năng mở rộng & Bảo trì (Maintainability & Scalability)
- Cấu trúc thư mục chia tách rõ ràng giữa Route, Controller, Service, Middleware.
- Cơ sở dữ liệu SQLite có sẵn file migration và seed data mẫu để khởi chạy nhanh trên mọi hệ điều hành.

---

## 5. Tiêu chuẩn Kiểm thử & Nghiệm thu (Acceptance Criteria)

1. Học viên có thể mua khóa học, upload ảnh chuyển khoản và mở khóa học khi Admin bấm duyệt.
2. Mã giới thiệu CTV ghi nhận chuẩn xác hoa hồng cho CTV ngay khi đơn hàng hoàn tất.
3. Admin có thể rút tiền cho CTV, chỉnh sửa khóa học và cấu hình gửi mail thành công.
