# Cơ sở dữ liệu

## Tổng quan

EduLearn sử dụng **SQLite** – cơ sở dữ liệu quan hệ nhúng, không cần server riêng.

- **File**: `backend/database.sqlite`
- **Thư viện**: `sqlite` + `sqlite3` (Node.js)
- **Schema**: Định nghĩa trong `backend/db.js`

---

## Sơ đồ quan hệ (ERD tóm tắt)

```
users ──────────────────────────────────────────────────────────
  │                                                              │
  ├── orders (user_id) ──── order_items (order_id, course_id)  │
  │                                                              │
  ├── user_courses (user_id, course_id)                          │
  │                                                              │
  ├── affiliates (user_id)                                       │
  │     └── affiliate_revenues (affiliate_id)                    │
  │     └── withdrawals (affiliate_id)                           │
  │                                                              │
  └── lesson_progress (user_id, lesson_id)                       │
                                                                 │
courses ─────────────────────────────────────────────────────────
  │
  ├── sections (course_id)
  │     └── lessons (section_id)
  │
  └── categories (id → courses.category_id)

combos ──── combo_courses (combo_id, course_id)
coupons
site_settings
banners
blogs
payment_methods
```

---

## Các bảng chính

### users
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | ID người dùng |
| name | TEXT | Họ tên |
| email | TEXT UNIQUE | Email đăng nhập |
| password | TEXT | Mật khẩu đã hash (bcrypt) |
| role | TEXT | `admin` / `user` |
| status | TEXT | `active` / `banned` |
| avatar | TEXT | Đường dẫn ảnh đại diện |
| created_at | DATETIME | Thời điểm đăng ký |

### courses
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | ID khóa học |
| title | TEXT | Tên khóa học |
| description | TEXT | Mô tả |
| category_id | INTEGER FK | Danh mục |
| price | REAL | Giá gốc |
| sale_price | REAL | Giá khuyến mãi |
| is_free | INTEGER | 0/1 |
| thumbnail | TEXT | Ảnh bìa |
| status | TEXT | `active`/`inactive` |

### orders
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | ID đơn hàng |
| user_id | INTEGER FK | Người mua |
| total_amount | REAL | Tổng tiền |
| discount_amount | REAL | Số tiền giảm |
| coupon_id | INTEGER FK | Mã giảm giá áp dụng |
| payment_method_id | INTEGER FK | Phương thức thanh toán |
| status | TEXT | `pending`/`completed`/`cancelled` |
| created_at | DATETIME | Thời điểm đặt hàng |

### site_settings
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INTEGER PK | Luôn là 1 (singleton) |
| site_name | TEXT | Tên website |
| site_slogan | TEXT | Slogan |
| logo_url | TEXT | Đường dẫn logo |
| primary_color | TEXT | Màu chủ đạo (hex) |
| secondary_color | TEXT | Màu phụ (hex) |
| contact_email | TEXT | Email liên hệ |
| contact_phone | TEXT | Số điện thoại |
| facebook_url | TEXT | Link Facebook |
| youtube_url | TEXT | Link YouTube |
