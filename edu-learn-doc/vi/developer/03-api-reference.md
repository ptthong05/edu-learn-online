# API Reference

## Thông tin chung

- **Base URL**: `http://localhost:5000`
- **Format**: JSON
- **Authentication**: Bearer Token (JWT)

## Header yêu cầu

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

---

## Authentication

### Đăng ký

```
POST /api/auth/register
```

**Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "message": "Đăng ký thành công",
  "token": "eyJ...",
  "user": { "id": 1, "name": "Nguyen Van A", "email": "...", "role": "user" }
}
```

### Đăng nhập

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "name": "...", "role": "user" }
}
```

---

## Khóa học

### Lấy danh sách khóa học

```
GET /api/courses
```

**Query params:**
| Param | Mô tả |
|-------|-------|
| `category_id` | Lọc theo danh mục |
| `search` | Tìm kiếm theo tên |
| `page` | Số trang (mặc định: 1) |
| `limit` | Số bản ghi/trang (mặc định: 12) |

### Lấy chi tiết khóa học

```
GET /api/courses/:id
```

### Tạo khóa học (Admin)

```
POST /api/courses
Authorization: Bearer <admin_token>
```

### Cập nhật khóa học (Admin)

```
PUT /api/courses/:id
Authorization: Bearer <admin_token>
```

### Xóa khóa học (Admin)

```
DELETE /api/courses/:id
Authorization: Bearer <admin_token>
```

---

## Đơn hàng

### Tạo đơn hàng

```
POST /api/orders
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [{"course_id": 1}, {"course_id": 2}],
  "coupon_code": "SALE20",
  "payment_method_id": 1
}
```

### Lấy danh sách đơn hàng (Admin)

```
GET /api/orders
Authorization: Bearer <admin_token>
```

### Cập nhật trạng thái đơn hàng (Admin)

```
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
```

**Body:**
```json
{ "status": "completed" }
```

---

## Cài đặt Website

### Lấy cài đặt website (Public)

```
GET /api/site-settings
```

**Response:**
```json
{
  "site_name": "EduLearn",
  "site_slogan": "Học không giới hạn",
  "logo_url": "/uploads/logo.png",
  "primary_color": "#6366f1",
  "secondary_color": "#8b5cf6",
  "contact_email": "contact@edulearn.vn"
}
```

### Cập nhật cài đặt (Admin)

```
PUT /api/site-settings
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

---

## Affiliate

### Lấy thông tin affiliate của tôi

```
GET /api/affiliate/me
Authorization: Bearer <token>
```

### Yêu cầu rút tiền

```
POST /api/affiliate/withdraw
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 500000,
  "bank_name": "Vietcombank",
  "account_number": "1234567890",
  "account_name": "NGUYEN VAN A"
}
```

---

## Mã lỗi

| HTTP Code | Ý nghĩa |
|-----------|---------|
| `200` | Thành công |
| `201` | Tạo thành công |
| `400` | Dữ liệu đầu vào không hợp lệ |
| `401` | Chưa xác thực (thiếu/sai token) |
| `403` | Không có quyền truy cập |
| `404` | Không tìm thấy tài nguyên |
| `500` | Lỗi server |
