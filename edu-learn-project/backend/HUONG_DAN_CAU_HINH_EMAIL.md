# Hướng dẫn cấu hình Email để gửi thông bận đơn hàng

## Vấn đề hiện tại
Email chưa được gửi vì chưa cấu hình mật khẩu email trong hệ thống.

## Giải pháp

### Cách 1: Cấu hình qua API (Khuyến nghị)

1. **Đăng nhập với tài khoản ADMIN** vào hệ thống
   - Email: manager@edulearn.vn
   - Password: admin123

2. **Lấy token xác thực**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"manager@edulearn.vn","password":"admin123"}'
   ```
   - Copy token từ response

3. **Cấu hình email** (thay YOUR_TOKEN và YOUR_APP_PASSWORD):
   ```bash
   curl -X PUT http://localhost:5000/api/admin/email-config \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "ptthong.www@gmail.com",
       "password": "YOUR_APP_PASSWORD",
       "from_name": "DRIVE MH - Học viện trực tuyến"
     }'
   ```

### Cách 2: Tạo App Password cho Gmail

**Bước 1: Bật xác thực 2 yếu tố**
1. Truy cập: https://myaccount.google.com/security
2. Tìm mục "Xác thực 2 yếu tố" (2-Step Verification)
3. Bật tính năng này

**Bước 2: Tạo App Password**
1. Trong trang Security, tìm "Mật khẩu ứng dụng" (App passwords)
2. Chọn "Mail" và "Other (custom name)"
3. Đặt tên: "DRIVE MH Backend"
4. Click "Generate"
5. **Copy mật khẩu 16 ký tự** (ví dụ: `abcd efgh ijkl mnop`)

**Bước 3: Cập nhật cấu hình**
- Sử dụng mật khẩu 16 ký tự vừa copy vào API call ở Cách 1

### Cách 3: Dùng script setup (Nhanh nhất)

```bash
cd edu-learn-project/backend

# Chạy script với app password
set EMAIL_PASSWORD=your-16-char-app-password
node setup-email.js
```

## Kiểm tra cấu hình

Sau khi cấu hình xong, kiểm tra trạng thái:

```bash
curl http://localhost:5000/api/email/status
```

Response thành công:
```json
{
  "configured": true,
  "email": "ptthong.www@gmail.com"
}
```

## Test email

Tạo đơn hàng test:
1. Mở trình duyệt, đăng nhập với tài khoản user
2. Thêm khóa học vào giỏ hàng
3. Thanh toán và bấm "Xác nhận thanh toán"
4. Kiểm tra email của user (và cả ptthong.www@gmail.com nếu user dùng email này)

## Xem log

Kiểm tra backend console để xem log email:
```
✅ Order confirmation email sent: <message-id>
```

Nếu có lỗi:
```
❌ Failed to send order confirmation email: [error message]
```

## Lưu ý quan trọng

1. **Phải dùng App Password**, không dùng mật khẩu thường của Gmail
2. **Tài khoản Gmail phải bật 2-Factor Authentication**
3. **Không chia sẻ App Password** với người khác
4. **Kiểm tra thư mục Spam** nếu không thấy email

## Cấu trúc email được gửi

Email sẽ bao gồm:
- ✅ Tiêu đề: "Cảm ơn bạn đã đặt hàng - DRIVE MH"
- ✅ Thông tin người đặt (họ tên, email, mã đơn hàng)
- ✅ Chi tiết đơn hàng (khóa học, giá, tổng tiền)
- ✅ Phương thức thanh toán
- ✅ Lưu ý: "Vui lòng kiểm tra email sau ít phút nữa để nhận thông tin truy cập khóa học"
- ✅ Thông tin liên hệ: ptthong.www@gmail.com

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log backend
2. Kiểm tra endpoint `/api/email/status`
3. Xem file EMAIL_SETUP.md để biết thêm chi tiết