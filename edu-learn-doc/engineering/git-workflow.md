# Quy Trình Quản Lý Mã Nguồn Git (Git Workflow)

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/engineering/`  

---

## 1. Mô hình Nhánh Git (Branching Strategy)

Dự án EduLearn áp dụng mô hình Git Flow rút gọn:

- `main` / `master`: Nhánh mã nguồn chính thức đã sẵn sàng triển khai lên Production.
- `develop`: Nhánh tích hợp các tính năng đang phát triển.
- `feature/<tên-tính-năng>`: Nhánh phát triển từng tính năng riêng lẻ (VD: `feature/affiliate-payout`, `feature/coupon-limit`).
- `fix/<tên-lỗi>`: Nhánh sửa lỗi phát sinh khẩn cấp (VD: `fix/email-reset-link`).

---

## 2. Quy chuẩn Commit Message (Conventional Commits)

Format: `<type>(<scope>): <mô tả ngắn bằng tiếng Việt hoặc tiếng Anh>`

Các kiểu `type` hay dùng:
- `feat`: Thêm tính năng mới (VD: `feat(course): thêm hỗ trợ video nhúng drive`).
- `fix`: Sửa lỗi (VD: `fix(order): sửa lỗi không ghi nhận hoa hồng affiliate`).
- `docs`: Cập nhật tài liệu (VD: `docs(srs): bổ sung tài liệu đặc tả SRS hệ thống`).
- `style`: Thay đổi giao diện CSS / UI (VD: `style(banner): chỉnh sửa banner trang chủ`).
- `refactor`: Tối ưu mã nguồn không làm thay đổi tính năng.
