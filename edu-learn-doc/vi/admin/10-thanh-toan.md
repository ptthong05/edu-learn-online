# Phương thức Thanh toán

## Tổng quan

Cấu hình các phương thức thanh toán được chấp nhận trên nền tảng EduLearn.

## Truy cập

`Admin Dashboard → Thanh toán`

## Các phương thức hỗ trợ

| Phương thức | Mô tả |
|------------|-------|
| Chuyển khoản ngân hàng | Thanh toán qua chuyển khoản trực tiếp |
| Ví điện tử (MoMo, ZaloPay) | Thanh toán qua ví điện tử |
| Thẻ tín dụng | Visa, Mastercard |

## Cấu hình phương thức

Với mỗi phương thức:

| Trường | Mô tả |
|--------|-------|
| Tên phương thức | Tên hiển thị cho người dùng |
| Hướng dẫn | Hướng dẫn chi tiết cách thanh toán |
| Thông tin tài khoản | Số TK, tên ngân hàng, QR Code |
| Trạng thái | Kích hoạt / Tắt |

## Quy trình thanh toán

1. Người dùng chọn khóa học và vào trang **Thanh toán**
2. Chọn phương thức thanh toán
3. Thực hiện chuyển khoản / quét QR
4. Upload ảnh chứng từ (biên lai)
5. Admin xác nhận và cập nhật trạng thái đơn thành `completed`
6. Hệ thống tự động kích hoạt quyền truy cập khóa học

## Lưu ý

- Hệ thống hiện tại dùng thanh toán thủ công (Admin xác nhận)
- Có thể tích hợp cổng thanh toán tự động (VNPay, Stripe) trong phiên bản nâng cao
