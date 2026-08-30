const { getDatabase } = require('./db.js');

async function checkFix() {
  const db = await getDatabase();
  console.log('--- 1. Kiểm tra PRAGMA foreign_keys ---');
  const fkStatus = await db.get('PRAGMA foreign_keys');
  console.log('foreign_keys setting:', fkStatus);

  console.log('\n--- 2. Kiểm tra Schema bảng orders & order_details ---');
  const tables = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('orders', 'order_details')");
  tables.forEach(t => {
    console.log(`\nTable [${t.name}]:\n${t.sql}`);
  });

  console.log('\n--- 3. Kiểm tra thực tế ràng buộc ON DELETE RESTRICT ---');
  // Thử tạo một user và order test
  try {
    await db.run("INSERT OR REPLACE INTO users (id, full_name, email, password, role, status, created_at) VALUES ('test-u-fk', 'Test User', 'testfk@test.com', '123', 'USER', 'active', datetime('now'))");
    await db.run("INSERT OR REPLACE INTO orders (id, user_id, total, payment_method, created_at) VALUES ('test-ord-fk', 'test-u-fk', 100000, 'momo', datetime('now'))");
    
    // Thử xóa user 'test-u-fk' xem có bị RESTRICT chặn không
    try {
      await db.run("DELETE FROM users WHERE id = 'test-u-fk'");
      console.log('❌ CẢNH BÁO: Xóa user thành công (Khóa ngoại ON DELETE RESTRICT chưa chặn được!)');
    } catch (fkErr) {
      console.log('✅ THÀNH CÔNG: CSDL đã chặn xóa User khi có đơn hàng:', fkErr.message);
    }
  } finally {
    // Dọn dẹp data test
    await db.run("DELETE FROM orders WHERE id = 'test-ord-fk'");
    await db.run("DELETE FROM users WHERE id = 'test-u-fk'");
  }
}

checkFix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
