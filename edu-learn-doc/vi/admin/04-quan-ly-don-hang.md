# Quản lý Đơn hàng

## Tổng quan

Theo dõi và quản lý tất cả giao dịch mua hàng trên nền tảng EduLearn.

## Truy cập

`Admin Dashboard → Đơn hàng`

## Danh sách đơn hàng

| Cột | Mô tả |
|-----|-------|
| Mã đơn | ID đơn hàng duy nhất |
| Người mua | Tên & email người mua |
| Sản phẩm | Khóa học / Combo đã mua |
| Tổng tiền | Số tiền thanh toán |
| Phương thức | Hình thức thanh toán |
| Trạng thái | `pending` / `completed` / `cancelled` |
| Ngày tạo | Thời điểm đặt hàng |

## Trạng thái đơn hàng

| Trạng thái | Ý nghĩa |
|-----------|---------|
| `pending` | Chờ xác nhận thanh toán |
| `completed` | Thanh toán thành công, kích hoạt quyền truy cập |
| `cancelled` | Đơn hàng bị hủy |

## Xem chi tiết đơn hàng

- Thông tin người mua
- Danh sách sản phẩm trong đơn
- Mã giảm giá đã áp dụng (nếu có)
- Thông tin thanh toán
- Lịch sử trạng thái đơn hàng

## Lọc & Tìm kiếm

- Tìm theo **mã đơn hàng** hoặc **email người mua**
- Lọc theo **trạng thái**
- Lọc theo **khoảng thời gian** (ngày bắt đầu – ngày kết thúc)
- Lọc theo **phương thức thanh toán**

## Xuất báo cáo

Xuất danh sách đơn hàng ra file Excel/CSV theo bộ lọc hiện tại.

## Thống kê doanh thu

Biểu đồ hiển thị:
- **Doanh thu theo ngày/tuần/tháng**
- **Top khóa học bán chạy**
- **Số đơn hàng theo trạng thái**
