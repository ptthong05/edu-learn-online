# EduLearn – Documentation

> Tài liệu chính thức của nền tảng học trực tuyến **EduLearn**.

## Giới thiệu

EduLearn là nền tảng học trực tuyến toàn diện, hỗ trợ quản lý khóa học, bài học qua Google Drive, đơn hàng, thanh toán chuyển khoản với ảnh minh chứng, hệ thống tiếp thị liên kết (Affiliate marketing) nâng cao, mã giảm giá, bài viết blog, và phân quyền người dùng chuyên sâu.

## Cấu trúc thư mục

```
edu-learn-doc/
├── architecture/       # Kiến trúc hệ thống, thiết kế CSDL (ERD), đặc tả API & bảo mật
├── discovery/          # Khám phá sản phẩm, Lộ trình tính năng (Roadmap), User Personas
├── engineering/        # Quy chuẩn lập trình, Git Workflow, Cấu hình môi trường
├── requirements/       # Đặc tả yêu cầu phần mềm (SRS), Use Cases, Yêu cầu nghiệp vụ
├── design/             # Thiết kế UI/UX, màu sắc, typography, component guide
├── en/                 # Tài liệu tiếng Anh (Admin, User, Developer)
├── vi/                 # Tài liệu tiếng Việt (Admin, User, Developer)
├── templates/          # Mẫu tài liệu, email templates, báo cáo
├── .gitignore
├── package.json
└── README.md           # File này
```

## Danh mục tài liệu chính

| Thư mục | Nội dung tài liệu |
|---------|-------------------|
| **[requirements/](./requirements/)** | **SRS (Software Requirements Specification)**, Functional/Non-Functional Requirements, Use Cases |
| **[architecture/](./architecture/)** | System Architecture (Monolith Next.js + Express), Database Schema (SQLite), RESTful APIs |
| **[discovery/](./discovery/)** | Feature Roadmap (v1.0 & v2.0), User Personas, Competitive Analysis |
| **[engineering/](./engineering/)** | Coding Standards, Git Branch Strategy, Setup Guide |

## Ngôn ngữ

| Ngôn ngữ | Thư mục |
|----------|---------|
| Tiếng Việt | vi/ |
| Tiếng Anh | en/ |

## Phiên bản

- **Dự án**: EduLearn v1.0
- **Tài liệu**: v1.1.0
- **Cập nhật lần cuối**: 2026-08-05

## Stack công nghệ

| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | SQLite3 |
| Auth | JWT (JSON Web Tokens), Bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| File Upload | Multer |
