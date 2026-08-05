# Chi Tiết Yêu Cầu Chức Năng (Functional Requirements)

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/requirements/`  

---

## 1. Yêu cầu Chức năng theo Vai trò (Role-Based Matrix)

| Chức năng | Khách (Guest) | Học viên (USER) | Cộng tác viên (AFFILIATE) | Quản trị (ADMIN/STAFF) |
|-----------|:-------------:|:---------------:|:-------------------------:|:----------------------:|
| Xem danh sách khóa học & bài viết |  X |  X |  X |  X |
| Đăng ký / Đăng nhập |  X |  X |  X |  X |
| Mua khóa học / Đơn hàng | |  X |  X | |
| Tải ảnh chuyển khoản (Minh chứng) | |  X |  X | |
| Xem video học trực tuyến (Drive) | |  X (Nếu đã mua) |  X (Nếu đã mua) |  X |
| Tạo link ref & Xem hoa hồng CTV | | |  X | |
| Đặt lệnh rút tiền hoa hồng | | |  X | |
| Quản lý khóa học, bài học, combo | | | |  X |
| Duyệt đơn hàng & duyệt xác nhận tiền | | | |  X |
| Duyệt tài khoản CTV & Lệnh rút tiền | | | |  X |
| Cấu hình Mail SMTP, Banner, Trang tĩnh | | | |  X |

---

## 2. Chi tiết Chức năng Phân hệ Học viên & Khóa học

### 2.1 Xem & Học trực tuyến
- **Mở khóa bài học:** Bài học chỉ mở xem toàn bộ video Drive khi trạng thái đơn hàng chứa khóa học đó là `completed` và `payment_status = da_thanh_toan`.
- **Trình chiếu Video:** Nhúng video Google Drive mượt mà, hỗ trợ phóng to toàn màn hình, ghi nhớ tiến trình học tập.
- **Tài liệu đính kèm:** Cho phép tải tài liệu bài học (PDF, Source code zip) được đính kèm trong khóa học.

### 2.2 Đơn hàng & Thanh toán Chuyển khoản
- **Tính toán tổng tiền:** `Thành tiền = (Tổng giá các khóa học/combo) - (Số tiền giảm giá từ Coupon)`.
- **Tải lên ảnh minh chứng (`payment_proof`):** Cho phép chọn ảnh chụp màn hình ứng dụng ngân hàng và tải lên ngay sau khi chuyển khoản.
- **Trạng thái đơn hàng:**
  - `pending` / `chua_thanh_toan`: Mới tạo đơn.
  - `completed` / `da_thanh_toan`: Đã được duyệt bởi Admin.
  - `cancelled`: Đơn bị hủy do sai thông tin hoặc trùng lặp.

---

## 3. Chi tiết Chức năng Phân hệ Cộng tác viên (Affiliate)

### 3.1 Quy trình Tiếp thị
1. CTV lấy đường dẫn giới thiệu dạng: `https://edulearn.vn/courses/course-id?ref=CTV123`.
2. Khách hàng click vào link ref $\rightarrow$ Hệ thống ghi nhận 1 lượt click vào `affiliate_clicks`.
3. Khách hàng hoàn tất thanh toán mua khóa học $\rightarrow$ Hệ thống tính hoa hồng dựa trên % cấu hình (`commission_rate`, mặc định 15%) và ghi vào `affiliate_revenues`.

### 3.2 Quy trình Rút tiền
1. CTV gửi yêu cầu rút tiền với số tiền $X$ VNĐ.
2. Kiểm tra số dư khả dụng $Balance = \sum(Commission_{approved}) - \sum(Withdrawn_{completed})$.
3. Admin xác minh và chuyển tiền thủ công vào STK của CTV, sau đó đánh dấu lệnh rút là `completed`.
