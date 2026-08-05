# Hướng Dẫn Thiết Lập Môi Trường Phát Triển (Environment Setup Guide)

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/engineering/`

---

## 1. Yêu cầu Tiền đề (Prerequisites)

- Node.js version >= 18.0.0.
- npm version >= 9.0.0.
- SQLite3 (Tùy chọn CLI tool nếu muốn duyệt trực tiếp file `database.sqlite`).

---

## 2. Các bước Cài đặt & Khởi chạy Cục bộ (Local Development Setup)

### Bước 1: Khởi chạy Backend API

```bash
cd edu-learn-project/backend
npm install
node index.js
```

> Server Backend sẽ chạy mặc định tại: `http://localhost:5000`  
> Tự động khởi tạo file CSDL `database.sqlite` và các bảng ban đầu nếu chưa có.

---

### Bước 2: Cấu hình Email SMTP (Nếu muốn gửi Mail thực tế)

Tạo hoặc cập nhật thông tin SMTP trong giao diện Admin hoặc qua file môi trường:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=edulearn.support@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # App Password của Gmail
```

---

### Bước 3: Khởi chạy Frontend Web Client

```bash
cd edu-learn-project/frontend
npm install
npm run dev
```

> Web Client sẽ chạy tại địa chỉ: `http://localhost:3000`

---

## 3. Tài khoản Mẫu Đăng nhập Thử nghiệm

- **Admin Account:**
  - Email: `manager@edulearn.vn`
  - Password: `admin123` (hoặc mật khẩu mặc định khởi tạo)
- **User / Affiliate Test Account:**
  - Có thể đăng ký tài khoản trực tiếp trên giao diện `http://localhost:3000/register`.
