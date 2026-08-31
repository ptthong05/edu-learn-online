# EduLearn Operations Guide (Hướng dẫn Vận hành Hệ thống)

> **Tài liệu tham chiếu chi tiết:** [06-operations-guide.md](file:///c:/Users/pttho/OneDrive/Desktop/edu-learn-online/edu-learn-doc/vi/developer/06-operations-guide.md)

---

## 1. Quick Start (Khởi chạy hệ thống)

```bash
# Khởi chạy toàn bộ dịch vụ (Frontend, Backend, Database)
docker compose up -d --build

# Kiểm tra log vận hành
docker compose logs -f
```

---

## 2. Sao lưu CSDL (Backup)

```bash
# Sao lưu cơ sở dữ liệu SQLite
cp ./edu-learn-project/backend/database.sqlite ./backups/database_$(date +%Y%m%d_%H%M%S).sqlite

# Sao lưu thư mục tệp tin uploads
tar -czvf ./backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz ./edu-learn-project/backend/uploads/
```

---

## 3. Khôi phục CSDL (Restore)

```bash
# Tạm dừng Backend
docker compose stop backend

# Khôi phục file SQLite
cp ./backups/database_YYYYMMDD_HHMMSS.sqlite ./edu-learn-project/backend/database.sqlite

# Khởi động lại Backend
docker compose start backend
```

---

## 4. Quy trình Hoàn tác (Rollback)

```bash
# Quay lại phiên bản mã nguồn ổn định
git checkout <STABLE_COMMIT_HASH>

# Re-build container
docker compose up -d --build
```

---

## 5. Xử lý sự cố (Troubleshooting)

* **SQLite Lock**: Kích hoạt `PRAGMA journal_mode=WAL;`.
* **CORS Error**: Kiểm tra `FRONTEND_URL` trong file `.env` của Backend.
* **Uploads Permission**: Cấp quyền `chmod -R 755 backend/uploads`.
