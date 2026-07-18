# Hệ thống Affiliate (Tiếp thị liên kết)

## Tổng quan

EduLearn cung cấp hệ thống affiliate cho phép người dùng kiếm hoa hồng khi giới thiệu khách hàng mua khóa học.

## Truy cập

`Admin Dashboard → Affiliate`

## Quản lý Affiliates

### Danh sách Affiliate

| Cột | Mô tả |
|-----|-------|
| Người dùng | Tên & email affiliate |
| Mã giới thiệu | Mã link referral duy nhất |
| Tổng doanh thu | Doanh thu phát sinh qua link |
| Hoa hồng | Tổng hoa hồng được hưởng |
| Đã rút | Số tiền đã rút về |
| Còn lại | Số dư hiện tại |
| Trạng thái | `active` / `suspended` |

## Tỷ lệ hoa hồng

Admin cấu hình tỷ lệ hoa hồng mặc định (ví dụ: 20% mỗi đơn hàng thành công giới thiệu được).

## Quản lý Rút tiền (Withdrawals)

Khi affiliate yêu cầu rút tiền:

| Trạng thái | Ý nghĩa |
|-----------|---------|
| `pending` | Chờ Admin xét duyệt |
| `approved` | Đã duyệt, đang xử lý chuyển khoản |
| `rejected` | Từ chối yêu cầu |
| `completed` | Đã chuyển tiền thành công |

### Xét duyệt rút tiền
1. Vào **Affiliate → Yêu cầu rút tiền**
2. Xem thông tin tài khoản ngân hàng của affiliate
3. Chuyển khoản thủ công
4. Cập nhật trạng thái thành `completed`

## Thống kê Affiliate

- **Tổng affiliate**: Số lượng người tham gia
- **Doanh thu từ affiliate**: Tổng doanh thu được giới thiệu
- **Hoa hồng phải trả**: Tổng số tiền hoa hồng cần thanh toán
- **Đã thanh toán**: Tổng đã chuyển khoản

## Thông báo Affiliate

Admin có thể gửi thông báo đến tất cả hoặc một số affiliate cụ thể thông qua tính năng **Affiliate Notifications**.
