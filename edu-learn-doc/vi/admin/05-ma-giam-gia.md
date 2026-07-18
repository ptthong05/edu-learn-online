# Quản lý Mã giảm giá (Coupon)

## Tổng quan

Tạo và quản lý mã giảm giá để khuyến mãi cho người dùng.

## Truy cập

`Admin Dashboard → Mã giảm giá`

## Tạo mã giảm giá mới

### Thông tin cơ bản

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| Mã coupon | ✅ | Chuỗi ký tự (VD: SALE50) |
| Loại giảm giá | ✅ | `percent` (%) hoặc `fixed` (VNĐ) |
| Giá trị giảm | ✅ | Số phần trăm hoặc số tiền cố định |
| Giảm tối đa | ❌ | Giới hạn số tiền giảm tối đa (với loại %) |
| Giá trị đơn tối thiểu | ❌ | Đơn hàng tối thiểu để áp dụng |
| Số lần dùng tối đa | ❌ | Giới hạn tổng lần sử dụng |
| Ngày hết hạn | ❌ | Thời điểm coupon hết hiệu lực |
| Trạng thái | ✅ | `active` / `inactive` |

## Loại giảm giá

| Loại | Ví dụ | Ý nghĩa |
|------|-------|---------|
| `percent` | 20 | Giảm 20% tổng giá trị đơn hàng |
| `fixed` | 50000 | Giảm 50.000đ trực tiếp |

## Theo dõi sử dụng

- **Số lần đã dùng**: Bao nhiêu lần coupon đã được áp dụng
- **Tổng tiền đã giảm**: Tổng số tiền đã giảm qua coupon này
- **Danh sách đơn hàng**: Các đơn hàng đã dùng coupon này

## Lọc & Tìm kiếm

- Tìm theo **mã coupon**
- Lọc theo **trạng thái** (active/inactive)
- Lọc coupon **còn hạn / hết hạn**
