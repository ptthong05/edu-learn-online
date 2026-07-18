# Cấu trúc Dự án

## Tổng quan

```
edu-learn-project/
├── backend/             # Server Node.js + Express
│   ├── index.js         # File chính, định nghĩa toàn bộ API routes
│   ├── db.js            # Khởi tạo & schema database SQLite
│   ├── middleware.js     # Middleware xác thực JWT
│   ├── emailService.js  # Dịch vụ gửi email
│   ├── migrations/      # Database migrations
│   ├── uploads/         # File upload (ảnh, tài liệu)
│   └── .env             # Biến môi trường
│
└── frontend/            # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (auth)/          # Trang đăng nhập, đăng ký
        │   ├── (client)/        # Trang người dùng
        │   │   ├── page.tsx     # Trang chủ
        │   │   ├── courses/     # Danh sách & chi tiết khóa học
        │   │   ├── blog/        # Trang blog
        │   │   ├── cart/        # Giỏ hàng
        │   │   ├── checkout/    # Thanh toán
        │   │   ├── combos/      # Combo khóa học
        │   │   └── tai-khoan/   # Trang tài khoản
        │   ├── admin/           # Khu vực Admin
        │   │   ├── page.tsx     # Dashboard
        │   │   ├── courses/     # Quản lý khóa học
        │   │   ├── users/       # Quản lý người dùng
        │   │   ├── orders/      # Quản lý đơn hàng
        │   │   ├── coupons/     # Mã giảm giá
        │   │   ├── affiliates/  # Hệ thống affiliate
        │   │   ├── blogs/       # Quản lý blog
        │   │   └── site-settings/ # Cài đặt website
        │   └── api/             # Next.js API routes (proxy)
        ├── components/
        │   ├── client/
        │   │   └── layout/
        │   │       ├── Header.tsx
        │   │       └── Footer.tsx
        │   └── ui/              # UI components dùng chung
        ├── lib/
        │   ├── hooks/           # Custom React hooks
        │   ├── utils/           # Utility functions
        │   └── useSiteSettings.ts # Hook lấy cài đặt website
        └── types/               # TypeScript type definitions
```

## Công nghệ sử dụng

### Frontend
| Thư viện | Mục đích |
|----------|---------|
| Next.js 14 | Framework React với App Router |
| TypeScript | Kiểm tra kiểu tĩnh |
| Tailwind CSS | Styling utility-first |
| React Hook Form | Quản lý form |

### Backend
| Thư viện | Mục đích |
|----------|---------|
| Express.js 5 | HTTP server & routing |
| SQLite + sqlite3 | Cơ sở dữ liệu |
| bcryptjs | Hash mật khẩu |
| jsonwebtoken | Xác thực JWT |
| multer | Upload file |
| nodemailer | Gửi email |
| cors | Cross-Origin Resource Sharing |
| dotenv | Quản lý biến môi trường |
