const { getDatabase } = require('./db.js');

async function migrate() {
  const db = await getDatabase();
  console.log('🚀 Bắt đầu cập nhật cấu trúc schema CSDL...');
  
  await db.exec('PRAGMA foreign_keys = OFF;');
  
  // 1. Cập nhật bảng orders
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders_new (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'chua_thanh_toan',
      payment_proof TEXT,
      payment_qr_content TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
    );
  `);

  // Kiểm tra các cột có sẵn trong orders để copy chính xác
  const orderColumns = await db.all("PRAGMA table_info(orders)");
  const colNames = orderColumns.map(c => c.name).join(', ');
  await db.exec(`INSERT OR IGNORE INTO orders_new (${colNames}) SELECT ${colNames} FROM orders;`);
  await db.exec(`DROP TABLE orders; ALTER TABLE orders_new RENAME TO orders;`);

  // 2. Cập nhật bảng order_details
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_details_new (
      order_id TEXT,
      course_id TEXT,
      price INTEGER NOT NULL,
      product_name TEXT,
      PRIMARY KEY (order_id, course_id),
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE RESTRICT
    );
  `);

  const odColumns = await db.all("PRAGMA table_info(order_details)");
  const odColNames = odColumns.map(c => c.name).join(', ');
  await db.exec(`INSERT OR IGNORE INTO order_details_new (${odColNames}) SELECT ${odColNames} FROM order_details;`);
  await db.exec(`DROP TABLE order_details; ALTER TABLE order_details_new RENAME TO order_details;`);

  await db.exec('PRAGMA foreign_keys = ON;');
  console.log('✅ Đã cập nhật xong 100% schema bảng orders và order_details trong file database.sqlite!');
}

migrate().then(() => process.exit(0)).catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
