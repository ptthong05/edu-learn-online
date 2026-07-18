# Quản lý Khóa học

## Tổng quan

Mô-đun quản lý khóa học cho phép Admin tạo, chỉnh sửa, xóa và quản lý trạng thái của các khóa học trên nền tảng.

## Truy cập

`Admin Dashboard → Khóa học`

## Danh sách khóa học

Hiển thị bảng các khóa học với các cột:
- **Tên khóa học** – Tiêu đề khóa học
- **Danh mục** – Danh mục phân loại
- **Giảng viên** – Người tạo/sở hữu khóa học
- **Giá gốc / Giá khuyến mãi** – Thông tin giá
- **Học viên** – Số lượng người đã đăng ký
- **Trạng thái** – `active` / `inactive`
- **Thao tác** – Xem, Sửa, Xóa

## Tạo khóa học mới

### Thông tin cơ bản
| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| Tên khóa học | ✅ | Tiêu đề hiển thị |
| Mô tả ngắn | ✅ | Tóm tắt nội dung |
| Mô tả đầy đủ | ❌ | Nội dung chi tiết (hỗ trợ HTML) |
| Danh mục | ✅ | Chọn từ danh sách danh mục |
| Thumbnail | ❌ | Ảnh bìa khóa học |
| Video giới thiệu | ❌ | URL video preview |

### Thông tin giá
| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| Giá gốc | ✅ | Giá niêm yết (VNĐ) |
| Giá khuyến mãi | ❌ | Giá sau giảm (để trống = không giảm) |
| Học miễn phí | ❌ | Checkbox cho khóa học free |

### Nội dung khóa học
- Thêm các **Chương** (Section)
- Trong mỗi chương thêm các **Bài học** (Lesson)
- Mỗi bài học hỗ trợ: Video URL, Tài liệu PDF, Nội dung văn bản

## Chỉnh sửa khóa học

1. Nhấn biểu tượng ✏️ tại hàng khóa học cần sửa
2. Cập nhật thông tin
3. Nhấn **Lưu thay đổi**

## Xóa khóa học

> ⚠️ **Cảnh báo**: Xóa khóa học sẽ xóa toàn bộ nội dung và lịch sử mua của học viên.

1. Nhấn biểu tượng 🗑️
2. Xác nhận trong hộp thoại

## Quản lý trạng thái

| Trạng thái | Ý nghĩa |
|-----------|---------|
| `active` | Khóa học hiển thị và có thể mua |
| `inactive` | Ẩn khỏi trang người dùng |

## Tìm kiếm & Lọc

- Tìm theo **tên khóa học**
- Lọc theo **danh mục**
- Lọc theo **trạng thái**
- Sắp xếp theo **ngày tạo**, **giá**, **số học viên**
