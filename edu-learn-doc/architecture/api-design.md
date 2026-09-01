# Đặc Tả Thiết Kế API RESTful & OpenAPI Specification

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/architecture/`  
> **Swagger UI Trực Quan:** `http://localhost:5000/api-docs`  
> **Tệp đặc tả chuẩn:** `openapi.json` (OpenAPI 3.0.3)

---

## 1. Quy chuẩn chung (API Conventions)

- **Base URL:** `http://localhost:5000/api`
- **Format dữ liệu:** `application/json` (Hỗ trợ `multipart/form-data` khi tải ảnh bằng chứng)
- **Xác thực:** JSON Web Token (JWT) qua Header: `Authorization: Bearer <token>`
- **Mã phản hồi HTTP chuẩn:**
  - `200 OK`: Truy vấn / Xử lý thành công.
  - `201 Created`: Tạo tài nguyên mới thành công.
  - `400 Bad Request`: Tham số không hợp lệ / Thiếu trường dữ liệu.
  - `401 Unauthorized`: Chưa xác thực hoặc Token hết hạn.
  - `403 Forbidden`: Không có quyền truy cập vai trò.
  - `404 Not Found`: Không tìm thấy tài nguyên.
  - `500 Internal Server Error`: Lỗi máy chủ hệ thống.

---

## 2. Danh sách Endpoints Chính (Đồng bộ với Backend Implementation)

### 2.1 Authentication & User Profile
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| POST | `/api/register` | Đăng ký tài khoản người dùng mới | Public |
| POST | `/api/login` | Đăng nhập tài khoản & Nhận JWT token | Public |
| POST | `/api/forgot-password` | Gửi email yêu cầu đặt lại mật khẩu | Public |
| POST | `/api/reset-password` | Đặt lại mật khẩu với reset token | Public |
| GET | `/api/users/profile` | Lấy thông tin cá nhân của người dùng hiện tại | User / CTV / Admin |
| PUT | `/api/users/profile` | Cập nhật thông tin họ tên, số điện thoại | User / CTV / Admin |
| PUT | `/api/users/change-password` | Đổi mật khẩu tài khoản | User / CTV / Admin |

---

### 2.2 Courses & Categories (`/api/courses`, `/api/admin/courses`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| GET | `/api/courses` | Lấy danh sách khóa học (Tìm kiếm, Phân trang, Danh mục) | Public |
| GET | `/api/courses/:id` | Xem thông tin chi tiết 1 khóa học | Public |
| GET | `/api/categories` | Lấy danh sách danh mục khóa học | Public |
| GET | `/api/admin/courses` | Quản lý toàn bộ danh sách khóa học | Admin / Staff |
| POST | `/api/admin/courses` | Tạo khóa học mới | Admin / Staff |
| PUT | `/api/admin/courses/:id` | Cập nhật thông tin khóa học | Admin / Staff |
| DELETE | `/api/admin/courses/:id` | Xóa khóa học khỏi hệ thống | Admin |
| GET | `/api/combos` | Lấy danh sách gói Combo khóa học | Public |
| POST | `/api/admin/combos` | Tạo gói Combo khóa học mới | Admin / Staff |
| PUT | `/api/admin/combos/:id` | Cập nhật gói Combo | Admin / Staff |
| DELETE | `/api/admin/combos/:id` | Xóa gói Combo | Admin |

---

### 2.3 Coupons & Giảm giá (`/api/orders/validate-coupon`, `/api/admin/coupons`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| POST | `/api/orders/validate-coupon` | Kiểm tra tính hợp lệ & tính giảm giá coupon | Public / User |
| GET | `/api/coupons/active` | Lấy danh sách mã giảm giá đang hoạt động | Public / User |
| GET | `/api/admin/coupons` | Quản lý danh sách mã giảm giá toàn hệ thống | Admin / Staff |
| POST | `/api/admin/coupons` | Tạo mới mã giảm giá (Theo % hoặc Tiền mặt) | Admin / Staff |
| PUT | `/api/admin/coupons/:id` | Sửa cấu hình mã giảm giá | Admin / Staff |
| DELETE | `/api/admin/coupons/:id` | Xóa mã giảm giá | Admin |

---

### 2.4 Orders & Payments (`/api/orders`, `/api/admin/orders`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| POST | `/api/orders` | Tạo đơn hàng mua khóa học / combo | User |
| GET | `/api/orders` | Xem danh sách đơn hàng của người dùng hiện tại | User |
| GET | `/api/orders/:id` | Xem chi tiết 1 đơn hàng cụ thể | User / Admin |
| POST | `/api/orders/upload-proof` | Tải lên ảnh biên lai chuyển khoản ngân hàng | User |
| GET | `/api/admin/orders` | Quản lý toàn bộ đơn hàng hệ thống | Admin / Staff |
| PUT | `/api/admin/orders/:id/status` | Cập nhật trạng thái xử lý đơn hàng | Admin / Staff |
| PUT | `/api/admin/orders/:id/payment-status` | Xác nhận duyệt thanh toán đơn hàng | Admin / Staff |

---

### 2.5 Affiliate & Withdrawals (`/api/affiliate`, `/api/admin/withdrawals`)
| Method | Endpoint | Description | Perm |
|--------|----------|-------------|------|
| POST | `/api/affiliate/register` | Gửi đơn đăng ký làm Cộng tác viên (CTV) | User |
| GET | `/api/affiliate/status` | Kiểm tra trạng thái duyệt đơn CTV | User / CTV |
| GET | `/api/affiliate/report` | Báo cáo lượt click, đơn hàng, hoa hồng CTV | CTV |
| POST | `/api/affiliate/withdrawals` | Tạo yêu cầu rút tiền hoa hồng (Tối thiểu 50.000đ) | CTV |
| GET | `/api/affiliate/withdrawals` | Lịch sử yêu cầu rút tiền của cá nhân CTV | CTV |
| GET | `/api/admin/affiliates` | Quản lý danh sách toàn bộ CTV hệ thống | Admin / Staff |
| PUT | `/api/admin/affiliates/:id/status` | Duyệt / Khóa quyền CTV | Admin / Staff |
| GET | `/api/admin/withdrawals` | Danh sách yêu cầu rút tiền của các CTV | Admin / Staff |
| PUT | `/api/admin/withdrawals/:id/status` | Duyệt chi trả (`completed`) / Từ chối (`rejected`) | Admin / Staff |
| GET | `/api/admin/affiliate/stats` | Thống kê doanh thu chi tiết theo từng CTV | Admin / Staff |

---

## 3. Thử Nghiệm API Trực Quan Qua Swagger UI

Hệ thống cung cấp giao diện Swagger UI tương tác trực tiếp tại:
📍 **URL:** `http://localhost:5000/api-docs`

Lập trình viên và Tester có thể:
1. Nhấn nút **Authorize** và nhập JWT Token.
2. Sử dụng tính năng **Try it out** để gửi request trực tiếp đến Backend.
3. Xem định dạng Request Body và Response Schema chuẩn của từng Endpoint.
