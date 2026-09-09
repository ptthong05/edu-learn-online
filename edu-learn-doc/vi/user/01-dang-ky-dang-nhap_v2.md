# Hướng dẫn Đăng ký, Đăng nhập & Khôi phục mật khẩu - Phiên bản v2

> **Phiên bản:** 2.0 (Cập nhật chuẩn hóa sau rà soát ORD-674, ORD-682)  
> **Áp dụng cho:** Hệ thống **EduLearn Online** (Frontend Web & Backend API)

---

## 1. Đăng ký tài khoản mới

### Bước 1: Truy cập trang đăng ký
- Trên Header trang chủ, nhấn nút **Đăng ký** hoặc truy cập trực tiếp đường dẫn: `/register`.

### Bước 2: Điền thông tin đăng ký
Biểu mẫu đăng ký yêu cầu người dùng điền đầy đủ và chính xác các trường thông tin sau:

| Tên trường | Bắt buộc | Quy tắc xác thực (Validation Rules) | Ghi chú & Ví dụ |
|:---|:---:|:---|:---|
| **Họ và tên** | ✅ | Không được để trống, tối thiểu 2 ký tự | Ví dụ: `Nguyễn Văn A` |
| **Email** | ✅ | Định dạng email hợp lệ (`user@domain.com`), chưa từng đăng ký trong hệ thống | Ví dụ: `nguyenvana@gmail.com` |
| **Số điện thoại** | ✅ | Gồm đúng **10 chữ số**, bắt đầu bằng các đầu số hợp lệ của Việt Nam: `03`, `05`, `07`, `08`, `09` | Ví dụ: `0912345678` |
| **Mật khẩu** | ✅ | Tối thiểu **6 ký tự** | Ví dụ: `Matkhau@123` |
| **Xác nhận mật khẩu** | ✅ | Phải trùng khớp 100% với giá trị đã nhập ở ô Mật khẩu | Trùng khớp với mật khẩu |

![Giao diện Đăng ký tài khoản](../../images/01-dang-ky.png)

### Bước 3: Hoàn tất đăng ký & Chuyển hướng
- Nhấn nút **Đăng ký tài khoản**.
- Hệ thống gửi yêu cầu `POST /api/auth/register`. Sau khi thành công, hệ thống hiển thị thông báo:
  > *"🎉 Đăng ký thành công! Đang chuyển hướng sang Đăng nhập..."*
- Hệ thống tự động chuyển hướng người dùng sang trang **Đăng nhập (`/login`)** sau 1.5 giây.

---

## 2. Đăng nhập hệ thống

### Bước 1: Truy cập trang đăng nhập
- Nhấn nút **Đăng nhập** trên Header hoặc truy cập đường dẫn: `/login`.

### Bước 2: Nhập thông tin xác thực
- **Email**: Nhập địa chỉ email đã đăng ký.
- **Mật khẩu**: Nhập mật khẩu tài khoản.

![Giao diện Đăng nhập hệ thống](../../images/02-dang-nhap.png)

### Bước 3: Cơ chế Xác thực & Quản lý Phiên làm việc (JWT)
- Hệ thống gửi yêu cầu `POST /api/auth/login`.
- Sau khi xác thực thành công:
  - **Lưu trữ Token:** JWT Token và dữ liệu User được lưu trữ đồng bộ tại `localStorage`, `sessionStorage` và `cookie` để hỗ trợ cả Client-side Rendering và Server-side Middleware.
  - **JWT Payload chuẩn:** Gồm `id`, `email`, `role`, `full_name`, `must_change_password`, `status`.
  - **Phân luồng điều hướng:**
    - Học viên (`USER`) & Cộng tác viên (`AFFILIATE`): Chuyển về **Trang chủ** hoặc trang mua sắm trước đó.
    - Quản trị viên (`MANAGER` / `STAFF`): Tự động điều hướng vào trang **Admin Dashboard (`/admin`)**.

---

## 3. Quên mật khẩu & Khôi phục mật khẩu

1. Trên màn hình Đăng nhập, nhấn vào liên kết **Quên mật khẩu?** (hoặc truy cập `/forgot-password`).

![Giao diện Quên mật khẩu](../../images/03-quen-mat-khau.png)

2. Nhập địa chỉ **Email** đã đăng ký và nhấn nút **Gửi yêu cầu đặt lại mật khẩu** (`POST /api/forgot-password`).
3. Hệ thống sinh mã token khôi phục và gửi liên kết xác thực tới hòm thư email của bạn.
4. Nhấp vào liên kết trong email để mở trang Đặt lại mật khẩu (`/reset-password?token=...`).
5. Nhập **Mật khẩu mới** (tối thiểu **6 ký tự**) và xác nhận mật khẩu (`POST /api/reset-password`).
6. Đăng nhập lại hệ thống bằng mật khẩu mới vừa thiết lập.

---

## 4. Đăng xuất tài khoản

1. Nhấp chuột vào biểu tượng **Avatar / Tên tài khoản** ở góc trên cùng bên phải Header.
2. Trong menu thả xuống, chọn mục **Đăng xuất**.
3. Hệ thống sẽ xóa sạch Token trong `cookie`, `localStorage`, `sessionStorage` và đưa giao diện về trạng thái khách vãng lai.
