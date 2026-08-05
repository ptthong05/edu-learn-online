# Tài Liệu Kiến Trúc Hệ Thống (System Architecture)

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/architecture/`  

---

## 1. Mô hình Kiến trúc Tổng quan (High-Level Architecture)

EduLearn triển khai mô hình kiến trúc **Monolith Client-Server**, tối ưu tốc độ triển khai và quản lý đơn giản:

```
[ Frontend: Next.js 14 ] <---- Direct REST API (JSON) ----> [ Backend: Express.js Node Server ]
      |                                                                   |
      |                                                       +-----------+-----------+
      v                                                       v                       v
[ User Browser ]                                    [ SQLite Database ]       [ Uploads Storage ]
  (React / HTML5 Video Drive)                       (database.sqlite)         (/uploads/proofs)
```

---

## 2. Thành phần Kỹ thuật (Tech Stack Details)

### 2.1 Web Frontend (Client Layer)
- **Framework:** Next.js 14 (React 18, TypeScript).
- **Styling:** Tailwind CSS, Lucide React Icons.
- **State Management & Data Fetching:** React Hooks, Custom Fetch Utilities.
- **Routing:** App Router (`src/app`).

### 2.2 API Service (Server Layer)
- **Runtime:** Node.js v18+.
- **Web Framework:** Express.js.
- **Authentication:** JSON Web Token (`jsonwebtoken`) + `bcryptjs`.
- **Email Service:** `nodemailer` tích hợp Gmail SMTP / Custom SMTP.
- **File Upload Service:** `multer` lưu trữ file đính kèm vào đĩa cục bộ.

### 2.3 Storage Layer
- **Relational DB:** SQLite (`sqlite3` / `sqlite` promise wrapper).
- **Static Assets:** Static directory Express `/uploads` cung cấp hình ảnh khóa học, banner, minh chứng chuyển khoản.

---

## 3. Kiến trúc Bảo mật & Phân quyền

### 3.1 Luồng Xác thực JWT (JSON Web Token)
1. User gửi thông tin `email` & `password` tới `/api/auth/login`.
2. Backend kiểm tra password hash bcrypt. Nếu đúng, tạo JWT Token chứa `id`, `email`, `role`.
3. Client lưu Token vào LocalStorage / Cookie và đính kèm vào Header `Authorization: Bearer <token>` cho mọi request bảo vệ.

```
Client                             Server                           Database
  |                                   |                                |
  |-- POST /api/auth/login ---------->|                                |
  |   {email, password}               |-- Query user by email -------->|
  |                                   |<-- User record with hash ------|
  |                                   |-- Verify bcrypt ---------------|
  |<-- 200 OK + JWT Token ------------|                                |
```

### 3.2 Phân quyền Middleware (`middleware.js`)
- `verifyToken`: Kiểm tra tính hợp lệ của JWT token.
- `verifyAdmin`: Yêu cầu `role === 'ADMIN'`.
- `verifyStaffOrAdmin`: Yêu cầu `role === 'ADMIN'` hoặc `role === 'MANAGER'` hoặc `role === 'STAFF'`.
