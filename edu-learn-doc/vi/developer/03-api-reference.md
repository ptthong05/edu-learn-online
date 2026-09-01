# Tài liệu Tham Khảo API (API Reference)

Tài liệu chi tiết các Endpoints của nền tảng **EduLearn Online**, được đồng bộ trực tiếp với Backend Implementation và đặc tả OpenAPI 3.0.

> **Swagger UI Trực Quan:** `http://localhost:5000/api-docs`  
> **OpenAPI JSON Spec:** `http://localhost:5000/api/docs/openapi.json`

---

## 1. Thông tin chung

* **Base URL**: `http://localhost:5000/api`
* **Format**: `application/json` (hỗ trợ `multipart/form-data` cho upload ảnh)
* **Authentication**: `Authorization: Bearer <jwt_token>`

---

## 2. Authentication & User Profile

### Đăng ký tài khoản
```http
POST /api/register
Content-Type: application/json
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678"
}
```

### Đăng nhập hệ thống
```http
POST /api/login
Content-Type: application/json
```
**Response 200:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_102",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "USER"
  }
}
```

### Quên mật khẩu & Đặt lại mật khẩu
* **Yêu cầu mã reset:** `POST /api/forgot-password` (Body: `{ "email": "..." }`)
* **Đặt lại mật khẩu:** `POST /api/reset-password` (Body: `{ "token": "...", "new_password": "..." }`)

### Thông tin cá nhân & Đổi mật khẩu
* **Lấy profile:** `GET /api/users/profile` (Auth: Bearer)
* **Cập nhật profile:** `PUT /api/users/profile` (Auth: Bearer, Body: `{ "full_name": "...", "phone": "..." }`)
* **Đổi mật khẩu:** `PUT /api/users/change-password` (Auth: Bearer, Body: `{ "old_password": "...", "new_password": "..." }`)

---

## 3. Khóa học & Combo

### Lấy danh sách khóa học (Public)
```http
GET /api/courses?category=lap-trinh&search=React
```

### Lấy chi tiết khóa học
```http
GET /api/courses/:id
```

### Quản lý khóa học (Admin)
* **Lấy toàn bộ khóa học:** `GET /api/admin/courses` (Auth: Bearer Admin)
* **Tạo khóa học mới:** `POST /api/admin/courses` (Auth: Bearer Admin)
* **Cập nhật khóa học:** `PUT /api/admin/courses/:id` (Auth: Bearer Admin)
* **Xóa khóa học:** `DELETE /api/admin/courses/:id` (Auth: Bearer Admin)

### Combo khóa học
* **Danh sách combo:** `GET /api/combos`
* **Tạo combo (Admin):** `POST /api/admin/combos`
* **Sửa combo (Admin):** `PUT /api/admin/combos/:id`
* **Xóa combo (Admin):** `DELETE /api/admin/combos/:id`

---

## 4. Mã giảm giá (Coupons)

### Kiểm tra & tính toán mã giảm giá
```http
POST /api/orders/validate-coupon
Content-Type: application/json
```
**Request Body:**
```json
{
  "code": "GIAM20",
  "subtotal": 500000
}
```

### Quản lý Coupons (Admin)
* **Danh sách:** `GET /api/admin/coupons`
* **Tạo mới:** `POST /api/admin/coupons`
* **Sửa:** `PUT /api/admin/coupons/:id`
* **Xóa:** `DELETE /api/admin/coupons/:id`

---

## 5. Đơn hàng (Orders & Payments)

### Tạo đơn hàng mới
```http
POST /api/orders
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "items": [
    { "course_id": "crs_1", "product_name": "React Pro", "price": 499000 }
  ],
  "coupon_code": "GIAM20",
  "payment_method": "bank_transfer",
  "affiliate_code": "TRIPM123"
}
```

### Tải lên ảnh biên lai chuyển khoản
```http
POST /api/orders/upload-proof
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
* `order_id`: string
* `proof_image`: File binary

### Quản lý đơn hàng (Admin)
* **Lấy toàn bộ đơn hàng:** `GET /api/admin/orders`
* **Cập nhật trạng thái đơn:** `PUT /api/admin/orders/:id/status` (Body: `{ "status": "completed" }`)
* **Duyệt thanh toán:** `PUT /api/admin/orders/:id/payment-status` (Body: `{ "payment_status": "da_thanh_toan" }`)

---

## 6. Tiếp thị liên kết (Affiliate) & Rút tiền

### Đăng ký CTV & Báo cáo hiệu suất
* **Đăng ký CTV:** `POST /api/affiliate/register`
* **Báo cáo doanh thu CTV:** `GET /api/affiliate/report` (Auth: Bearer CTV)

### Yêu cầu rút tiền hoa hồng
```http
POST /api/affiliate/withdrawals
Authorization: Bearer <token>
```
**Request Body (Tối thiểu 50.000đ):**
```json
{
  "amount": 500000,
  "bank_name": "Techcombank",
  "account_number": "190358291829",
  "account_holder": "NGUYEN VAN A"
}
```

### Quản trị Rút tiền CTV (Admin)
* **Danh sách yêu cầu rút tiền:** `GET /api/admin/withdrawals` (Auth: Bearer Admin)
* **Duyệt/Từ chối chi trả:** `PUT /api/admin/withdrawals/:id/status` (Body: `{ "status": "completed" | "rejected" }`)

---

## 7. Mã lỗi HTTP chuẩn

| HTTP Code | Ý nghĩa |
| :--- | :--- |
| `200 OK` | Xử lý yêu cầu thành công |
| `201 Created` | Tạo mới tài nguyên thành công |
| `400 Bad Request` | Dữ liệu gửi lên không hợp lệ hoặc thiếu trường bắt buộc |
| `401 Unauthorized` | Thiếu Token xác thực hoặc Token đã hết hạn |
| `403 Forbidden` | Không đủ quyền hạn truy cập (yêu cầu vai trò Admin/Manager) |
| `404 Not Found` | Không tìm thấy tài nguyên |
| `500 Internal Error` | Lỗi máy chủ |
