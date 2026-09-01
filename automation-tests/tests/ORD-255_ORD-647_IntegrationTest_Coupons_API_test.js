'use strict';

const assert = require('node:assert/strict');
const nodeTest = require('node:test');

// Tương thích đa nền tảng runner 
const Feature = global.Feature || (() => {});
const Scenario = global.Scenario || ((name, fn) => {
  if (typeof nodeTest === 'function') {
    nodeTest(name, fn);
  } else if (typeof nodeTest.test === 'function') {
    nodeTest.test(name, fn);
  } else {
    fn();
  }
});

/**
 * ==============================================================================
 *  BỘ KIỂM THỬ TÍCH HỢP (INTEGRATION TESTING - API & DATABASE & RBAC)
 * ==============================================================================
 * Story: ORD-255 - [STORY 3.1] Phân hệ Mã giảm giá
 * Subtask: ORD-647 - Kiểm thử tích hợp - Module Mã giảm giá (Coupons API)
 * Mục tiêu: Kiểm thử tích hợp toàn diện 6 API Endpoints, CSDL SQLite và Phân quyền RBAC
 * Target Server: http://localhost:5000
 * ==============================================================================
 */

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
let adminToken = '';

async function getAdminToken() {
  if (adminToken) return adminToken;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@edulearn.vn', password: 'admin123' })
    });
    const data = await res.json();
    adminToken = data.token;
    return adminToken;
  } catch (err) {
    console.error('Lỗi khi lấy token admin:', err.message);
    return '';
  }
}

Feature('ORD-647: Kiểm thử tích hợp (Integration Testing) - Module Mã giảm giá (Coupons API)');

// ==============================================================================
// 1. IT-CP-01: POST /api/coupons/validate - Áp dụng thành công coupon hợp lệ (HTTP 200)
// ==============================================================================
Scenario('ORD-647 [IT-CP-01]: POST /api/coupons/validate - Áp dụng mã hợp lệ thành công (HTTP 200)', async () => {
  const token = await getAdminToken();
  const testCode = `ITVALID${Date.now()}`;

  // Chuẩn bị: Tạo 1 coupon hợp lệ trong CSDL qua API Admin
  await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      code: testCode,
      discount: 10,
      discount_type: 'percent',
      quantity: 50,
      expired_date: '2099-12-31',
      status: 'active'
    })
  });

  // Thực thi: Khách hàng áp dụng mã vào đơn hàng 1.000.000đ
  const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: testCode, order_amount: 1000000 })
  });

  assert.strictEqual(res.status, 200, 'HTTP Status phải là 200');
  const data = await res.json();
  assert.strictEqual(data.valid, true, 'valid phải là true');
  assert.strictEqual(data.calculated_discount, 100000, 'Mức giảm 10% của 1.000.000đ phải là 100.000đ');
  assert.strictEqual(data.message, 'Áp dụng mã giảm giá thành công!');
});

// ==============================================================================
// 2. IT-CP-02: POST /api/coupons/validate - Báo lỗi khi mã không hợp lệ / không tồn tại (HTTP 400/404)
// ==============================================================================
Scenario('ORD-647 [IT-CP-02]: POST /api/coupons/validate - Báo lỗi khi mã rỗng hoặc không tồn tại', async () => {
  // Case A: Mã rỗng
  const emptyRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '', order_amount: 500000 })
  });
  assert.strictEqual(emptyRes.status, 400, 'Mã rỗng phải trả về 400');

  // Case B: Mã ảo không có trong CSDL
  const fakeRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'FAKE_CODE_XYZ_9999', order_amount: 500000 })
  });
  assert.strictEqual(fakeRes.status, 404, 'Mã không tồn tại phải trả về 404');
  const fakeData = await fakeRes.json();
  assert.strictEqual(fakeData.valid, false);
});

// ==============================================================================
// 3. IT-CP-03: GET /api/coupons - Lấy danh sách Public coupons đang active (HTTP 200)
// ==============================================================================
Scenario('ORD-647 [IT-CP-03]: GET /api/coupons - Khách vãng lai lấy danh sách public coupons (HTTP 200)', async () => {
  const res = await fetch(`${BASE_URL}/api/coupons`);
  assert.strictEqual(res.status, 200, 'Khách vãng lai có thể lấy danh sách public coupons');
  const data = await res.json();
  assert.ok(Array.isArray(data), 'Response phải là một danh sách mảng Array');
});

// ==============================================================================
// 4. IT-CP-04: GET /api/admin/coupons - Quản trị viên xem toàn bộ coupons (HTTP 200)
// ==============================================================================
Scenario('ORD-647 [IT-CP-04]: GET /api/admin/coupons - Quản trị viên xem toàn bộ danh sách coupons (HTTP 200)', async () => {
  const token = await getAdminToken();
  const res = await fetch(`${BASE_URL}/api/admin/coupons`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(res.status, 200, 'Admin có Token phải truy cập được danh sách');
  const data = await res.json();
  assert.ok(Array.isArray(data), 'Kết quả phải là danh sách');
});

// ==============================================================================
// 5. IT-CP-05: POST /api/admin/coupons - Quản trị viên tạo coupon mới thành công (HTTP 201)
// ==============================================================================
Scenario('ORD-647 [IT-CP-05]: POST /api/admin/coupons - Quản trị viên tạo coupon mới thành công (HTTP 201)', async () => {
  const token = await getAdminToken();
  const newCode = `CREATE${Date.now()}`;
  const res = await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      code: newCode,
      discount: 25,
      discount_type: 'percent',
      quantity: 100,
      expired_date: '2099-12-31',
      status: 'active',
      description: 'Mã coupon test tích hợp tự động'
    })
  });

  assert.strictEqual(res.status, 201, 'Tạo mới thành công phải trả về HTTP 201');
  const data = await res.json();
  assert.ok(data.coupon, 'Dữ liệu trả về phải chứa object coupon');
  assert.strictEqual(data.coupon.code, newCode);
});

// ==============================================================================
// 6. IT-CP-06: POST /api/admin/coupons - Báo lỗi khi tạo mã coupon bị trùng (HTTP 400)
// ==============================================================================
Scenario('ORD-647 [IT-CP-06]: POST /api/admin/coupons - Ràng buộc CSDL chặn tạo trùng mã coupon (HTTP 400)', async () => {
  const token = await getAdminToken();
  const duplicateCode = `DUP${Date.now()}`;

  // Tạo lần 1
  await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      code: duplicateCode,
      discount: 15,
      quantity: 10,
      expired_date: '2099-12-31'
    })
  });

  // Tạo lần 2 cùng mã
  const dupRes = await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      code: duplicateCode,
      discount: 15,
      quantity: 10,
      expired_date: '2099-12-31'
    })
  });

  assert.strictEqual(dupRes.status, 400, 'Tạo trùng mã phải bị chặn với mã lỗi 400');
  const data = await dupRes.json();
  assert.ok(data.message.includes('tồn tại'), 'Thông báo phải nêu rõ mã đã tồn tại');
});

// ==============================================================================
// 7. IT-CP-07: PUT /api/admin/coupons/:id - Quản trị viên cập nhật thông tin coupon (HTTP 200)
// ==============================================================================
Scenario('ORD-647 [IT-CP-07]: PUT /api/admin/coupons/:id - Quản trị viên cập nhật coupon (HTTP 200)', async () => {
  const token = await getAdminToken();
  const code = `UPDATE${Date.now()}`;

  // Tạo coupon để update
  const createRes = await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      code,
      discount: 10,
      quantity: 10,
      expired_date: '2099-12-31'
    })
  });
  const created = await createRes.json();
  const couponId = created.coupon.id;

  // Thực hiện PUT cập nhật
  const updateRes = await fetch(`${BASE_URL}/api/admin/coupons/${couponId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      code: `${code}_UPDATED`,
      discount: 30,
      quantity: 50,
      expired_date: '2099-12-31',
      status: 'active'
    })
  });

  assert.strictEqual(updateRes.status, 200, 'Cập nhật thành công phải trả về 200');
});

// ==============================================================================
// 8. IT-CP-08: DELETE /api/admin/coupons/:id - Quản trị viên xóa coupon thành công (HTTP 200)
// ==============================================================================
Scenario('ORD-647 [IT-CP-08]: DELETE /api/admin/coupons/:id - Quản trị viên xóa coupon thành công (HTTP 200)', async () => {
  const token = await getAdminToken();
  const code = `DEL${Date.now()}`;

  const createRes = await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      code,
      discount: 10,
      quantity: 10,
      expired_date: '2099-12-31'
    })
  });
  const created = await createRes.json();
  const couponId = created.coupon.id;

  // Xóa hợp lệ
  const delRes = await fetch(`${BASE_URL}/api/admin/coupons/${couponId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(delRes.status, 200, 'Xóa thành công phải trả về 200');
});

// ==============================================================================
// 9. IT-CP-09: DELETE /api/admin/coupons/:id - Xóa coupon không tồn tại trả về 404
// ==============================================================================
Scenario('ORD-647 [IT-CP-09]: DELETE /api/admin/coupons/:id - Xóa coupon với ID không tồn tại (HTTP 404)', async () => {
  const token = await getAdminToken();
  const nonExistRes = await fetch(`${BASE_URL}/api/admin/coupons/non-existent-id-9999`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(nonExistRes.status, 404, 'Xóa ID không tồn tại phải trả về 404');
});

// ==============================================================================
// 10. IT-CP-10: Phân quyền RBAC - Chặn người dùng không có quyền gọi API Admin (HTTP 401)
// ==============================================================================
Scenario('ORD-647 [IT-CP-10]: Phân quyền RBAC - Chặn gọi API Admin khi không có Token (HTTP 401)', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/coupons`);
  assert.strictEqual(res.status, 401, 'Không gửi Authorization Header phải bị chặn với mã lỗi 401');
});
