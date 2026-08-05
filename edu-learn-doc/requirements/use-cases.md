# Danh Sách Use Cases & Luồng Nghiệp Vụ (Use Cases & Workflows)

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/requirements/`  

---

## 1. Sơ đồ Use Case Tổng quan

```
+------------------------------------------------------------------------+
|                              EduLearn System                           |
|                                                                        |
|  [ Guest / Học Viên ]                                                  |
|       |---> UC-01: Đăng ký / Đăng nhập                                 |
|       |---> UC-02: Tìm kiếm & Xem khóa học                             |
|       |---> UC-03: Đặt mua khóa học & Nhập Mã giảm giá                |
|       |---> UC-04: Upload minh chứng thanh toán                        |
|       |---> UC-05: Học qua Video Google Drive                          |
|       |---> UC-06: Đăng ký tài khoản CTV Affiliate                     |
|                                                                        |
|  [ Cộng tác viên (Affiliate) ]                                         |
|       |---> UC-07: Lấy Link / Mã giới thiệu                            |
|       |---> UC-08: Xem báo cáo hoa hồng & Đơn giới thiệu               |
|       |---> UC-09: Tạo yêu cầu Rút tiền về Ngân hàng                   |
|                                                                        |
|  [ Admin / Manager ]                                                   |
|       |---> UC-10: Quản lý Khóa học, Combo & Bài học                   |
|       |---> UC-11: Kiểm tra minh chứng & Duyệt đơn hàng                |
|       |---> UC-12: Phê duyệt Cộng tác viên & Duyệt lệnh Rút tiền       |
|       |---> UC-13: Cấu hình Email SMTP, Banner & Cài đặt hệ thống     |
|                                                                        |
+------------------------------------------------------------------------+
```

---

## 2. Chi tiết các Use Case Trọng tâm

### UC-03 & UC-04: Mua Khóa học & Tải Minh chứng Thanh toán

- **Actor chính:** Học viên (USER).
- **Điều kiện tiên quyết:** Học viên đã đăng nhập tài khoản.
- **Luồng sự kiện chính:**
  1. Học viên mở chi tiết khóa học hoặc Combo, bấm **"Thêm vào giỏ"** hoặc **"Mua ngay"**.
  2. Tại trang Thanh toán, nhập Mã giảm giá (nếu có) và nhấn **"Áp dụng"**.
  3. Hệ thống hiển thị số tiền thanh toán cuối cùng và thông tin tài khoản ngân hàng nhận tiền + Mã QR.
  4. Học viên mở app ngân hàng chuyển khoản đúng nội dung và số tiền.
  5. Học viên bấm **"Tải ảnh minh chứng"**, chọn file ảnh đính kèm và bấm **"Xác nhận thanh toán"**.
  6. Hệ thống tạo đơn hàng với trạng thái `pending` và chuyển học viên tới trang Lịch sử đơn hàng.

---

### UC-11: Duyệt Đơn hàng & Mở khóa Học tập (Admin)

- **Actor chính:** Quản trị viên (ADMIN / STAFF).
- **Điều kiện tiên quyết:** Đơn hàng ở trạng thái `pending`.
- **Luồng sự kiện chính:**
  1. Admin mở danh sách **Quản lý đơn hàng**.
  2. Xem ảnh minh chứng thanh toán đính kèm đơn hàng.
  3. So sánh giao dịch nhận tiền thực tế trên ngân hàng.
  4. Nếu khớp tiền: Admin nhấn nút **"Duyệt thanh toán"**.
  5. Hệ thống chuyển `status = completed`, `payment_status = da_thanh_toan`.
  6. Khóa học tự động được gán quyền xem cho học viên. Nếu đơn mua qua ref CTV, hệ thống tự động tính và ghi nhận hoa hồng cho CTV.

---

### UC-09 & UC-12: Rút tiền Hoa hồng CTV

- **Actor chính:** Cộng tác viên (Affiliate) & Admin.
- **Luồng sự kiện chính:**
  1. CTV vào trang **Quản lý Affiliate**, bấm **"Yêu cầu rút tiền"**.
  2. Nhập số tiền muốn rút (không vượt quá số dư hoa hồng khả dụng).
  3. Yêu cầu tạo mới với trạng thái `pending`.
  4. Admin vào danh sách **Yêu cầu rút tiền**, kiểm tra STK ngân hàng và thực hiện chuyển tiền.
  5. Admin nhấn **"Xác nhận đã chuyển"** $\rightarrow$ Hệ thống cập nhật trạng thái `completed`.
