const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'manager@edulearn.vn';

db.run(
  "UPDATE users SET status = 'active' WHERE email = ? AND role = 'MANAGER'",
  [email],
  function(err) {
    if (err) {
      console.error('Lỗi:', err);
      process.exit(1);
    }
    
    if (this.changes === 0) {
      console.log('Không tìm thấy tài khoản manager@edulearn.vn');
    } else {
      console.log('✅ Đã mở khóa tài khoản manager@edulearn.vn thành công!');
    }
    
    db.close();
  }
);