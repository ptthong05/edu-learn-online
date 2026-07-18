# Database Schema

## Overview

EduLearn uses **SQLite** – an embedded relational database that requires no separate server.

- **File**: `backend/database.sqlite`
- **Library**: `sqlite` + `sqlite3` (Node.js)
- **Schema**: Defined in `backend/db.js`

---

## Entity Relationship (Summary)

```
users ──────────────────────────────────────────────────────
  │                                                          │
  ├── orders (user_id) ── order_items (order_id, course_id) │
  │                                                          │
  ├── user_courses (user_id, course_id)                      │
  │                                                          │
  ├── affiliates (user_id)                                   │
  │     └── affiliate_revenues (affiliate_id)                │
  │     └── withdrawals (affiliate_id)                       │
  │                                                          │
  └── lesson_progress (user_id, lesson_id)                   │
                                                             │
courses ─────────────────────────────────────────────────────
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

## Key Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | User ID |
| name | TEXT | Full name |
| email | TEXT UNIQUE | Login email |
| password | TEXT | Bcrypt hashed password |
| role | TEXT | `admin` / `user` |
| status | TEXT | `active` / `banned` |
| avatar | TEXT | Profile picture path |
| created_at | DATETIME | Registration time |

### courses
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Course ID |
| title | TEXT | Course name |
| description | TEXT | Description |
| category_id | INTEGER FK | Category |
| price | REAL | Original price |
| sale_price | REAL | Discounted price |
| is_free | INTEGER | 0/1 flag |
| thumbnail | TEXT | Cover image |
| status | TEXT | `active`/`inactive` |

### orders
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Order ID |
| user_id | INTEGER FK | Buyer |
| total_amount | REAL | Total amount |
| discount_amount | REAL | Discounted amount |
| coupon_id | INTEGER FK | Applied coupon |
| payment_method_id | INTEGER FK | Payment method |
| status | TEXT | `pending`/`completed`/`cancelled` |
| created_at | DATETIME | Order timestamp |

### site_settings
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Always 1 (singleton) |
| site_name | TEXT | Website name |
| site_slogan | TEXT | Tagline |
| logo_url | TEXT | Logo path |
| primary_color | TEXT | Brand primary color (hex) |
| secondary_color | TEXT | Secondary color (hex) |
| contact_email | TEXT | Contact email |
| contact_phone | TEXT | Phone number |
| facebook_url | TEXT | Facebook link |
| youtube_url | TEXT | YouTube link |
