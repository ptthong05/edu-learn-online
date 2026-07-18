# Hướng dẫn Cài đặt

## Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|----------|-------------------|
| Node.js | v18.0+ |
| npm | v9.0+ |
| Git | Bất kỳ phiên bản nào |

## Clone dự án

```bash
git clone <repository-url>
cd edu-learn-project
```

## Cài đặt Backend

```bash
cd backend
npm install
```

### Cấu hình môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### Khởi động Backend

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend chạy tại: `http://localhost:5000`

---

## Cài đặt Frontend

```bash
cd frontend
npm install
```

### Cấu hình môi trường

Tạo file `.env.local` trong thư mục `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Khởi động Frontend

```bash
# Development
npm run dev

# Build production
npm run build
npm start
```

Frontend chạy tại: `http://localhost:3000`

---

## Cơ sở dữ liệu

- Hệ thống sử dụng **SQLite** – không cần cài đặt thêm
- File database: `backend/database.sqlite`
- Database được khởi tạo tự động khi chạy backend lần đầu

### Reset database

```bash
cd backend
rm database.sqlite
node index.js  # Tự tạo lại
```

---

## Tài khoản Admin mặc định

Sau khi cài đặt lần đầu, tạo tài khoản admin qua:

```bash
cd backend
node reset-password.js
```

Hoặc đăng ký tài khoản qua trang web rồi thay đổi role trong database.
