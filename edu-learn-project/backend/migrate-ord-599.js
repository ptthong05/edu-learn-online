'use strict';

const { getDatabase } = require('./db.js');

async function migrateORD599() {
  const db = await getDatabase();
  console.log('🚀 Đang thực hiện migration cho ORD-599 (Thêm CHECK constraint)...');

  await db.exec('PRAGMA foreign_keys = OFF;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders_new (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
      payment_status TEXT DEFAULT 'chua_thanh_toan' CHECK (payment_status IN ('chua_thanh_toan', 'da_thanh_toan')),
      payment_proof TEXT,
      payment_qr_content TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
    );
  `);

  const orderColumns = await db.all("PRAGMA table_info(orders)");
  const colNames = orderColumns.map(c => c.name).join(', ');
  await db.exec(`INSERT OR IGNORE INTO orders_new (${colNames}) SELECT ${colNames} FROM orders;`);
  await db.exec(`DROP TABLE orders; ALTER TABLE orders_new RENAME TO orders;`);

  await db.exec('PRAGMA foreign_keys = ON;');
  console.log('✅ Đã cập nhật thành công CHECK constraint vào database.sqlite!');
}

migrateORD599().then(() => process.exit(0)).catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
