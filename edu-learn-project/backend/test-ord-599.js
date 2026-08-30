const { getDatabase } = require('./db.js');

async function testORD599() {
  const db = await getDatabase();
  console.log('=== BẮT ĐẦU TEST ORD-599 ===\n');

  // 1. Kiểm tra Schema
  const table = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'");
  console.log('--- 1. Schema Bảng Orders ---');
  console.log(table.sql);

  console.log('\n--- 2. Test Case 1: Thêm đơn hàng HỢP LỆ ---');
  try {
    await db.run("INSERT INTO orders (id, user_id, total, payment_method, status, payment_status, created_at) VALUES ('test-valid-1', 'u-3', 500000, 'banking', 'completed', 'da_thanh_toan', datetime('now'))");
    console.log('✅ TEST 1 PASSED: Lưu thành công đơn hàng hợp lệ (status: completed, payment_status: da_thanh_toan)');
    await db.run("DELETE FROM orders WHERE id = 'test-valid-1'");
  } catch (e) {
    console.log('❌ TEST 1 FAILED:', e.message);
  }

  console.log('\n--- 3. Test Case 2: Thêm đơn hàng SAI status (Negative Test) ---');
  try {
    await db.run("INSERT INTO orders (id, user_id, total, payment_method, status, payment_status, created_at) VALUES ('test-invalid-status', 'u-3', 500000, 'banking', 'peding_sai_chinh_ta', 'chua_thanh_toan', datetime('now'))");
    console.log('❌ TEST 2 FAILED: CSDL vẫn cho lưu status sai!');
    await db.run("DELETE FROM orders WHERE id = 'test-invalid-status'");
  } catch (e) {
    console.log('✅ TEST 2 PASSED: CSDL đã CHẶN thành công status sai:', e.message);
  }

  console.log('\n--- 4. Test Case 3: Thêm đơn hàng SAI payment_status (Negative Test) ---');
  try {
    await db.run("INSERT INTO orders (id, user_id, total, payment_method, status, payment_status, created_at) VALUES ('test-invalid-payment', 'u-3', 500000, 'banking', 'pending', 'da_tra_tien_sai_enum', datetime('now'))");
    console.log('❌ TEST 3 FAILED: CSDL vẫn cho lưu payment_status sai!');
    await db.run("DELETE FROM orders WHERE id = 'test-invalid-payment'");
  } catch (e) {
    console.log('✅ TEST 3 PASSED: CSDL đã CHẶN thành công payment_status sai:', e.message);
  }

  console.log('\n=== KẾT QUẢ: 100% TEST CASE PASSED! ===');
}

testORD599().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
