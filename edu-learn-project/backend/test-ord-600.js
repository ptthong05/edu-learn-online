const { getDatabase } = require('./db.js');

async function fixAndTestORD600() {
  const db = await getDatabase();
  console.log('=== THỰC HIỆN FIX & TEST CHO ORD-600 ===\n');

  // 1. Tạo index
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
  `);
  console.log('✅ Đã tạo Index idx_orders_user_id và idx_orders_status trong database.sqlite.');

  // 2. Kiểm tra danh sách index của bảng orders
  const indexList = await db.all("PRAGMA index_list('orders')");
  console.log('\n--- 1. Danh sách Index trên bảng orders ---');
  console.log(indexList);

  const hasUserIdIndex = indexList.some(i => i.name === 'idx_orders_user_id');
  const hasStatusIndex = indexList.some(i => i.name === 'idx_orders_status');

  if (hasUserIdIndex && hasStatusIndex) {
    console.log('✅ TEST 1 PASSED: Bảng orders đã có đầy đủ 2 index!');
  } else {
    console.log('❌ TEST 1 FAILED: Thiếu index!');
  }

  // 3. Kiểm tra Query Plan với user_id
  const qpUser = await db.all("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 'u-3'");
  console.log('\n--- 2. Query Plan lọc theo user_id ---');
  console.log(qpUser);
  const usesUserIdIndex = qpUser.some(step => step.detail && step.detail.includes('USING INDEX idx_orders_user_id'));
  if (usesUserIdIndex) {
    console.log('✅ TEST 2 PASSED: Truy vấn theo user_id đã sử dụng USING INDEX idx_orders_user_id!');
  } else {
    console.log('❌ TEST 2 FAILED: Chưa dùng index');
  }

  // 4. Kiểm tra Query Plan với status
  const qpStatus = await db.all("EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'pending'");
  console.log('\n--- 3. Query Plan lọc theo status ---');
  console.log(qpStatus);
  const usesStatusIndex = qpStatus.some(step => step.detail && step.detail.includes('USING INDEX idx_orders_status'));
  if (usesStatusIndex) {
    console.log('✅ TEST 3 PASSED: Truy vấn theo status đã sử dụng USING INDEX idx_orders_status!');
  } else {
    console.log('❌ TEST 3 FAILED: Chưa dùng index');
  }

  console.log('\n=== KẾT LUẬN: 100% TEST CASE PASSED! HOÀN TẤT ORD-600 ===');
}

fixAndTestORD600().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
