# Tài liệu Hướng dẫn Vận hành Hệ thống (Operations Guide)

Tài liệu này cung cấp quy trình chuẩn dành cho kỹ sư vận hành (DevOps / System Admin) quản trị nền tảng **EduLearn Online**, bao gồm: Quy trình Triển khai (Deploy), Sao lưu dữ liệu (Backup), Khôi phục (Restore), Quy trình Hoàn tác (Rollback) và Xử lý sự cố (Troubleshooting).

---

## 1. Tổng quan Kiến trúc Vận hành

Hệ thống EduLearn được đóng gói và vận hành dưới dạng các dịch vụ vi mô container hóa (Docker Containers):
* **Frontend Service**: Next.js 14 App Router, chạy tại cổng nội bộ `3000`.
* **Backend Service**: Node.js / Express REST API, chạy tại cổng nội bộ `5000`.
* **Database & File Storage**: SQLite Database (`database.sqlite`) lưu trữ dữ liệu tập trung, thư mục `uploads/` lưu trữ ảnh minh chứng và media.
* **Orchestration**: Quản lý bằng `docker-compose.yml`.

---

## 2. Quy trình Triển khai (Deployment Guide)

### 2.1 Yêu cầu môi trường máy chủ
* **Hệ điều hành**: Linux (Ubuntu 22.04 LTS / Debian 12) hoặc Windows Server có cài đặt WSL2.
* **Tài nguyên tối thiểu**: 2 vCPU, 4GB RAM, 20GB SSD.
* **Công cụ yêu cầu**: `Docker Engine >= 24.0`, `Docker Compose >= v2.20`, `Git`, `Node.js >= 18.x`.

### 2.2 Các bước triển khai mới (Initial Deployment)

1. **Clone mã nguồn dự án**:
   ```bash
   git clone https://github.com/ptthong05/edu-learn-online.git
   cd edu-learn-online
   ```

2. **Cấu hình biến môi trường (`.env`)**:
   Tạo file `.env` tại thư mục gốc hoặc trong từng module:
   ```env
   # Backend Config (.env)
   PORT=5000
   JWT_SECRET=your_super_secure_jwt_secret_key_2026
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=production

   # Frontend Config (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Khởi chạy toàn bộ hệ thống bằng Docker Compose**:
   ```bash
   # Build và khởi chạy ngầm tất cả container
   docker compose up -d --build
   ```

4. **Kiểm tra trạng thái container và log khởi động**:
   ```bash
   docker compose ps
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

5. **Chạy Migration CSDL (Nếu khởi tạo lần đầu)**:
   ```bash
   docker compose exec backend node migrate.js
   ```

---

## 3. Quy trình Sao lưu Dữ liệu Bền vững (Persistent Backup Guide)

Cơ sở dữ liệu của EduLearn sử dụng SQLite kết hợp với thư mục lưu trữ file tĩnh (`uploads/`). Để bảo đảm dữ liệu không bị mất khi container dừng hoặc rebuild, toàn bộ dữ liệu được gắn kết qua **Persistent Volumes / Bind Mounts** trong `docker-compose.yml`:
* `/app/database.sqlite` $\rightarrow$ `./edu-learn-project/backend/database.sqlite`
* `/app/uploads` $\rightarrow$ `./edu-learn-project/backend/uploads`
* `/app/backups` $\rightarrow$ `./backups`

### 3.1 Sao lưu CSDL SQLite an toàn (Online Safe Backup)
Để tránh tranh chấp ghi (Database Lock), sử dụng lệnh `VACUUM INTO` trực tiếp từ container đang chạy để ghi bản sao lưu ra thư mục `./backups/` trên host:

```bash
# Tạo thư mục chứa bản sao lưu trên host
mkdir -p ./backups

# 1. Sao lưu SQLite trực tiếp từ Container bằng VACUUM INTO
docker compose exec backend node -e "
const { getDatabase } = require('./db.js');
(async () => {
  const db = await getDatabase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = '/app/backups/backup_' + timestamp + '.sqlite';
  await db.run(\`VACUUM INTO '\${backupFile}'\`);
  console.log('✅ Backup created successfully at:', backupFile);
  process.exit(0);
})().catch(err => {
  console.error('❌ Backup failed:', err);
  process.exit(1);
});
"

# 2. Kiểm tra tính toàn vẹn (Integrity Check) của bản backup vừa tạo
sqlite3 ./backups/$(ls -t ./backups/*.sqlite | head -n 1 | xargs -n 1 basename) "PRAGMA integrity_check;"
```

### 3.2 Sao lưu thư mục tệp tin tải lên (`uploads/`)
```bash
tar -czvf ./backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz ./edu-learn-project/backend/uploads/
```

### 3.3 Thiết lập sao lưu tự động hàng ngày (Cron Job)
Tạo script `/opt/scripts/backup-edulearn.sh` và thêm vào `crontab -e`:
```bash
# Chạy sao lưu tự động mỗi ngày vào lúc 02:00 sáng
0 2 * * * /opt/scripts/backup-edulearn.sh >> /var/log/edulearn-backup.log 2>&1
```

---

## 4. Quy trình Phục hồi Dữ liệu Đã Kiểm Tra (Verified Restore Guide)

Khi xảy ra sự cố hỏng dữ liệu hoặc thao tác nhầm, thực hiện các bước phục hồi sau:

1. **Tạm dừng dịch vụ Backend**:
   ```bash
   docker compose stop backend
   ```

2. **Lưu lại bản dữ liệu lỗi hiện tại (để đối soát nếu cần)**:
   ```bash
   cp ./edu-learn-project/backend/database.sqlite ./edu-learn-project/backend/database.sqlite.corrupt.$(date +%s)
   ```

3. **Khôi phục file SQLite từ bản Backup đã được kiểm tra**:
   ```bash
   cp ./backups/backup_CHOOSE_DATE.sqlite ./edu-learn-project/backend/database.sqlite
   ```

4. **Kiểm tra tính toàn vẹn file database vừa khôi phục**:
   ```bash
   sqlite3 ./edu-learn-project/backend/database.sqlite "PRAGMA integrity_check;"
   ```

5. **Khôi phục thư mục hình ảnh uploads (nếu cần)**:
   ```bash
   tar -xzvf ./backups/uploads_CHOOSE_DATE.tar.gz -C ./edu-learn-project/backend/
   ```

6. **Khởi động lại dịch vụ và kiểm tra log**:
   ```bash
   docker compose start backend
   docker compose logs -f backend
   ```

---

## 5. Quy trình Hoàn tác Phiên bản (Rollback Procedure)

> **CẢNH BÁO BẢO VỆ DỮ LIỆU:** Tuyệt đối **không** chạy `docker compose up -d --build` trước khi thực hiện bước sao lưu snapshot dữ liệu hiện tại (`database.sqlite` & `uploads/`) ra vị trí an toàn ngoài container!

```
[Phát hiện lỗi nghiêm trọng] 
       ↓
[Bước 1: Sao lưu Snapshot Dữ liệu Hiện tại]
       ↓
[Bước 2: Rollback Mã nguồn Git / Docker Image]
       ↓
[Bước 3: Khởi động lại & Chạy Health-check Test]
```

### Bước 1: Sao lưu Snapshot dữ liệu trước khi Rollback
```bash
mkdir -p ./backups/pre-rollback-$(date +%Y%m%d_%H%M%S)
cp ./edu-learn-project/backend/database.sqlite ./backups/pre-rollback-$(date +%Y%m%d_%H%M%S)/
```

### Bước 2: Rollback Docker Containers / Git Commit
```bash
# Xem lịch sử release gần nhất
git log -n 5 --oneline

# Checkout về commit release ổn định trước đó
git checkout <STABLE_RELEASE_TAG_OR_COMMIT>

# Build lại container ở phiên bản ổn định (vẫn giữ nguyên persistent volumes)
docker compose up -d --build
```

### Bước 2: Rollback Schema CSDL (Nếu phiên bản mới có thay đổi schema)
Nếu phiên bản lỗi đã can thiệp schema CSDL, tiến hành restore lại file `database.sqlite` từ snapshot trước khi deploy.

### Bước 3: Chạy Smoke Test kiểm tra hệ thống
```bash
# Kiểm tra Health API Backend
curl -I http://localhost:5000/api/courses
# Kiểm tra giao diện Frontend
curl -I http://localhost:3000
```

---

## 6. Giám sát & Xử lý Sự cố (Troubleshooting)

| STT | Hiện tượng lỗi | Nguyên nhân tiềm ẩn | Giải pháp khắc phục |
|:---:|:---|:---|:---|
| **1** | Lỗi `SQLITE_BUSY: database is locked` | Nhiều tác vụ ghi đồng thời hoặc kết nối chưa đóng | • Kích hoạt chế độ WAL mode: `PRAGMA journal_mode=WAL;`<br>• Kiểm tra các transaction dài trong `backend/db.js`. |
| **2** | Lỗi `SQLITE_CONSTRAINT: CHECK constraint failed` | Ghi đè trạng thái không hợp lệ vào `orders` (`status` hoặc `payment_status`) | • Kiểm tra logic truyền giá trị trong payload API (chỉ chấp nhận `pending`, `completed`, `cancelled`). |
| **3** | Không xem được ảnh biên lai chuyển khoản | Thiếu cấp quyền thư mục `uploads/` hoặc sai đường dẫn static | • Phân quyền lại thư mục: `chmod -R 755 backend/uploads`<br>• Kiểm tra middleware `express.static` trong `backend/index.js`. |
| **4** | Lỗi `CORS error: Not allowed by CORS` | Sai cấu hình `FRONTEND_URL` trên Backend | • Kiểm tra biến môi trường `FRONTEND_URL` trong file cấu hình container Backend để khớp với domain Frontend. |
| **5** | Đầy dung lượng ổ cứng (Disk Full) | Log Docker hoặc cache build quá lớn | • Dọn dẹp cache docker: `docker system prune -f`<br>• Xoay vòng log container bằng tùy chọn `max-size: "50m"` trong `docker-compose.yml`. |

---

## 7. Liên hệ Hỗ trợ & Trực vận hành
* **Đội ngũ phát triển**: Dev & QA Team EduLearn
* **Kênh hỗ trợ khẩn cấp**: `ptthong.www@gmail.com` / Hotline Kỹ thuật: `0932 525 650`
