# EduLearn Operations Guide (Hướng dẫn Vận hành Hệ thống) - Phiên bản v2

> **Phiên bản:** 2.0 (Cập nhật chuẩn hóa quy trình Docker Volume, Backup & Safe Restore - Sửa lỗi ORD-683)  
> **Áp dụng cho:** Môi trường Deployment, Staging & Production của hệ thống **EduLearn Online**

---

## 1. Kiến trúc Persistent Volumes trong Docker Compose

Hệ thống bắt buộc cấu hình **Persistent Volumes** trong `docker-compose.yml` để đảm bảo dữ liệu không bị mất khi rebuild/restart container:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./edu-learn-project/backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
    volumes:
      # Liên kết CSDL SQLite từ máy Host vào Container
      - ./edu-learn-project/backend/database.sqlite:/app/database.sqlite
      # Liên kết thư mục upload ảnh minh chứng thanh toán & media
      - ./edu-learn-project/backend/uploads:/app/uploads
      # Liên kết thư mục chứa các bản sao lưu
      - ./backups:/app/backups
    restart: always

  frontend:
    build:
      context: ./edu-learn-project/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000
    depends_on:
      - backend
    restart: always
```

---

## 2. Quy trình Khởi chạy & Kiểm tra Dịch vụ

```bash
# 1. Khởi chạy toàn bộ hệ thống
docker compose up -d --build

# 2. Kiểm tra trạng thái hoạt động của các container
docker compose ps

# 3. Theo dõi log thời gian thực
docker compose logs -f backend
```

---

## 3. Quy trình Sao lưu Dữ liệu Chuẩn (Online Safe Backup)

Thực hiện sao lưu an toàn CSDL đang chạy thông qua lệnh `VACUUM INTO` mà không gây gián đoạn dịch vụ:

```bash
# 1. Tạo thư mục chứa backup trên máy host
mkdir -p ./backups

# 2. Thực hiện Online Backup an toàn từ container
docker compose exec backend node -e "
const { getDatabase } = require('./db.js');
(async () => {
  const db = await getDatabase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = '/app/backups/backup_' + timestamp + '.sqlite';
  await db.run(\`VACUUM INTO '\${backupFile}'\`);
  console.log('✅ Online Backup created successfully:', backupFile);
  process.exit(0);
})().catch(err => { console.error('❌ Backup failed:', err); process.exit(1); });
"

# 3. Kiểm tra tính toàn vẹn (Integrity Check) của bản backup
sqlite3 ./backups/$(ls -t ./backups/*.sqlite | head -n 1 | xargs -n 1 basename) "PRAGMA integrity_check;"

# 4. Sao lưu thư mục media / ảnh minh chứng
tar -czvf ./backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz ./edu-learn-project/backend/uploads/
```

---

## 4. Quy trình Phục hồi CSDL An toàn (Verified Safe Restore)

Khi có sự cố cần khôi phục dữ liệu:

```bash
# 1. Tạm dừng dịch vụ backend để đóng các kết nối đang mở
docker compose stop backend

# 2. Tạo bản sao lưu dự phòng cho database hiện tại trên host trước khi thay thế
cp ./edu-learn-project/backend/database.sqlite ./edu-learn-project/backend/database.sqlite.bak.$(date +%s)

# 3. Ghi đè file database từ bản backup đã xác minh tính toàn vẹn
cp ./backups/backup_CHOOSE_DATE.sqlite ./edu-learn-project/backend/database.sqlite

# 4. Kiểm tra lại tính toàn vẹn file CSDL
sqlite3 ./edu-learn-project/backend/database.sqlite "PRAGMA integrity_check;"

# 5. Phục hồi thư mục uploads (nếu cần)
tar -xzvf ./backups/uploads_CHOOSE_DATE.tar.gz -C ./edu-learn-project/backend/

# 6. Khởi động lại dịch vụ backend
docker compose start backend
docker compose logs -f backend
```

---

## 5. Quy trình Hoàn tác (Rollback Safe Procedure)

> [!CAUTION]
> **QUAN TRỌNG:** Tuyệt đối không chạy lệnh `docker compose up -d --build` trước khi sao lưu dữ liệu hiện tại (`database.sqlite` & `uploads/`) ra vị trí an toàn.

```bash
# 1. Sao lưu toàn bộ dữ liệu trước khi rollback
mkdir -p ./backups/pre-rollback-$(date +%Y%m%d_%H%M%S)
cp ./edu-learn-project/backend/database.sqlite ./backups/pre-rollback-$(date +%Y%m%d_%H%M%S)/
cp -r ./edu-learn-project/backend/uploads ./backups/pre-rollback-$(date +%Y%m%d_%H%M%S)/

# 2. Chuyển mã nguồn về commit / tag ổn định
git checkout <STABLE_TAG_OR_COMMIT>

# 3. Rebuild lại container mà vẫn giữ nguyên dữ liệu trên volume
docker compose up -d --build
```
