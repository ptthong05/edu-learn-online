# Xác thực & Phân quyền

## Cơ chế xác thực

EduLearn sử dụng **JWT (JSON Web Token)** để xác thực người dùng.

### Luồng xác thực

```
1. Người dùng đăng nhập → POST /api/auth/login
2. Server kiểm tra email + password (so sánh bcrypt hash)
3. Server tạo JWT token với payload: { id, email, role }
4. Server trả về token
5. Client lưu token vào localStorage
6. Mọi request tiếp theo: gửi kèm header Authorization: Bearer <token>
7. Server middleware xác minh token, gắn user vào request
```

### JWT Payload

```json
{
  "id": "u-1",
  "email": "manager@edulearn.vn",
  "role": "MANAGER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Thời hạn token

- Mặc định: **7 ngày**
- Cấu hình trong `backend/index.js` tại `jwt.sign(payload, secret, { expiresIn: '7d' })`

---

## Phân quyền (Authorization)

### Các vai trò (Roles)

| Vai trò | Mô tả |
|---------|-------|
| `MANAGER` | **Quản lý (Admin)**: Toàn quyền quản trị hệ thống và API. |
| `STAFF` | **Nhân viên**: Có quyền quản trị các tính năng bán hàng, khoá học, combo, mã giảm giá, bài viết. Bị ẩn và chặn các chức năng quản lý Người dùng và Tài khoản Quản trị. |
| `USER` | **Học viên**: Mua hàng, học tập trực tuyến, quản lý tài khoản cá nhân. |
| `AFFILIATE` | **Cộng tác viên**: Tham gia hệ thống tiếp thị liên kết, theo dõi doanh thu và rút tiền. |

### Middleware bảo vệ route (Backend)

Sử dụng middleware `requireRole(roles)` trong `backend/middleware.js` để kiểm tra quyền truy cập:

```javascript
// Cho phép cả Manager và Staff
app.get('/api/admin/courses', authenticateToken, checkUserStatus, requireRole(['MANAGER', 'STAFF']), ...)

// Chỉ cho phép Manager (Chặn Staff)
app.get('/api/admin/accounts', authenticateToken, checkUserStatus, requireRole(['MANAGER']), ...)
```

### Kiểm tra quyền Frontend

- **AdminLayout (`frontend/src/app/admin/layout.tsx`)**:
  - Bảo vệ các đường dẫn quản trị. Chỉ cho phép người dùng có role `MANAGER` hoặc `STAFF` truy cập.
  - Tự động ẩn các nút menu **Người dùng** (`/admin/users`) và **Tài khoản Quản trị** (`/admin/accounts`) trên Sidebar đối với vai trò `STAFF`.
  - Kiểm tra và tự động chặn điều hướng (Redirect) về `/admin` kèm thông báo toast nếu tài khoản `STAFF` cố gắng truy cập trực tiếp bằng URL.

---

## Mã hóa mật khẩu

Mật khẩu được hash bằng **bcryptjs** với salt rounds = 10:

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
```

---

## Bảo mật

- Token lưu trong `localStorage` phía client.
- CORS được cấu hình chỉ cho phép origin từ frontend.
- Tất cả API ghi dữ liệu yêu cầu xác thực.
- Các API chỉnh sửa cấu hình hệ thống và tài khoản nhạy cảm được giới hạn nghiêm ngặt theo vai trò thích hợp.
