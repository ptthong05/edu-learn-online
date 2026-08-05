# Đặc Tả Thiết Kế API RESTful (API Specification & Routes)

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/architecture/`  

---

## 1. Quy chuẩn chung (API Conventions)

- **Base URL:** `/api`
- **Format dữ liệu:** `application/json`
- **Mã phản hồi HTTP chuẩn:**
  - `200 OK`: Truy vấn / Xử lý thành công.
  - `201 Created`: Tạo tài nguyên mới thành công.
  - `400 Bad Request`: Tham số không hợp lệ.
  - `401 Unauthorized`: Chưa xác thực hoặc Token hết hạn.
  - `403 Forbidden`: Không có quyền truy cập.
  - `404 Not Found`: Không tìm thấy tài nguyên.
  - `500 Internal Server Error`: Lỗi máy chủ hệ thống.

---

## 2. Danh sách Endpoints Chính

### 2.1 Authenticaton (`/api/auth`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản người dùng mới | Public |
| POST | `/api/auth/login` | Đăng nhập tài khoản & Nhận JWT token | Public |
| POST | `/api/auth/forgot-password` | Gửi email yêu cầu đặt lại mật khẩu | Public |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu với reset token | Public |
| GET | `/api/auth/me` | Lấy thông tin tài khoản hiện tại | User |

---

### 2.2 Courses & Combos (`/api/courses`, `/api/combos`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| GET | `/api/courses` | Lấy danh sách khóa học (Tìm kiếm, Phân trang, Danh mục) | Public |
| GET | `/api/courses/:id` | Xem thông tin chi tiết 1 khóa học | Public |
| POST | `/api/courses` | Tạo khóa học mới | Admin/Staff |
| PUT | `/api/courses/:id` | Cập nhật thông tin khóa học | Admin/Staff |
| DELETE | `/api/courses/:id` | Xóa khóa học | Admin |
| GET | `/api/combos` | Lấy danh sách gói Combo khóa học | Public |

---

### 2.3 Orders & Payments (`/api/orders`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| POST | `/api/orders` | Tạo đơn hàng mua khóa học mới | User |
| POST | `/api/orders/:id/proof` | Upload ảnh minh chứng chuyển khoản (`multipart/form-data`) | User |
| GET | `/api/orders/my-orders` | Xem danh sách đơn hàng đã mua của cá nhân | User |
| GET | `/api/orders/admin/all` | Quản lý toàn bộ đơn hàng hệ thống | Admin/Staff |
| PUT | `/api/orders/admin/:id/status` | Duyệt thanh toán & Đổi trạng thái đơn | Admin/Staff |

---

### 2.4 Affiliate & Commission (`/api/affiliates`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| POST | `/api/affiliates/register` | Gửi đơn đăng ký làm CTV | User |
| GET | `/api/affiliates/my-stat` | Thống kê click, doanh thu & hoa hồng CTV | Affiliate |
| POST | `/api/affiliates/withdraw` | Tạo yêu cầu rút tiền về STK ngân hàng | Affiliate |
| GET | `/api/affiliates/admin/requests` | Xem toàn bộ danh sách rút tiền | Admin |
| PUT | `/api/affiliates/admin/requests/:id` | Duyệt / Từ chối đơn rút tiền | Admin |
