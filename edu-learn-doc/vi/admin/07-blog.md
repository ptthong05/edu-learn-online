# Quản lý Blog

## Tổng quan

EduLearn tích hợp hệ thống blog để chia sẻ bài viết, tin tức, và hướng dẫn học tập.

## Truy cập

`Admin Dashboard → Blog`

## Danh sách bài viết

| Cột | Mô tả |
|-----|-------|
| Tiêu đề | Tiêu đề bài viết |
| Tác giả | Người viết |
| Danh mục | Phân loại bài viết |
| Lượt xem | Số lần được đọc |
| Trạng thái | `published` / `draft` |
| Ngày tạo | Thời điểm đăng |

## Tạo bài viết mới

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| Tiêu đề | ✅ | Tiêu đề bài viết |
| Slug | ✅ | URL thân thiện (tự tạo từ tiêu đề) |
| Nội dung | ✅ | Nội dung bài viết (hỗ trợ Rich Text) |
| Ảnh thumbnail | ❌ | Ảnh đại diện bài viết |
| Tags | ❌ | Nhãn phân loại |
| Trạng thái | ✅ | `published` / `draft` |
| Tóm tắt | ❌ | Đoạn mô tả ngắn hiển thị ngoài trang danh sách |

## Trạng thái bài viết

| Trạng thái | Ý nghĩa |
|-----------|---------|
| `published` | Hiển thị công khai trên trang blog |
| `draft` | Bản nháp, chỉ Admin mới thấy |

## Tính năng

- **Tìm kiếm**: Tìm theo tiêu đề hoặc nội dung
- **Lọc**: Theo trạng thái, tác giả, khoảng thời gian
- **Phân trang**: 10 bài/trang
