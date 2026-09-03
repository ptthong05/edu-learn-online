const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-313',
  title: '[Kiểm thử lại] [Hệ thống] [Re-test] Xác nhận lại các lỗi đã sửa (CORS, JWT, Expired Date)'
});

suite.scenario({
  id: 'TC_RET_313_01',
  name: 'Re-test cấu hình CORS sau khi sửa wildcard',
  inputs: 'OPTIONS /api/courses; Origin=http://localhost:3000',
  steps: ['Gửi preflight OPTIONS.', 'Kiểm tra không HTTP 500.', 'Kiểm tra Access-Control-Allow-Origin không còn wildcard.'],
  expected: 'CORS phản hồi hợp lệ và không trả Access-Control-Allow-Origin=*.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/courses', {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET'
    }
  });
  assert.notEqual(res.status, 500, 'CORS preflight không được HTTP 500');
  const allowOrigin = res.headers['access-control-allow-origin'];
  assert.ok(allowOrigin, 'Thiếu Access-Control-Allow-Origin');
  assert.notEqual(allowOrigin, '*', 'CORS vẫn đang dùng wildcard *');
  return `status=${res.status}; allow-origin=${allowOrigin}`;
});

suite.scenario({
  id: 'TC_RET_313_02',
  name: 'Re-test JWT hết hạn bị middleware từ chối',
  inputs: 'Expired JWT; GET /api/admin/stats',
  steps: ['Sinh JWT hết hạn.', 'Gọi API quản trị.', 'Kiểm tra request bị từ chối.'],
  expected: 'HTTP 401/403 và không truy cập được dữ liệu quản trị.'
}, async ({ requestJson, expiredToken, bearer }) => {
  const res = await requestJson('/api/admin/stats', {
    headers: bearer(expiredToken())
  });
  assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
  return `Expired JWT rejected with HTTP ${res.status}`;
});

suite.scenario({
  id: 'TC_RET_313_03',
  name: 'Re-test Coupon expired_date đã quá hạn',
  inputs: 'Coupon test có expired_date trong quá khứ',
  steps: ['Tạo coupon hết hạn tạm thời trong SQLite.', 'POST /api/coupons/validate.', 'Kiểm tra coupon bị từ chối.', 'Dọn dữ liệu test.'],
  expected: 'Coupon hết hạn không được áp dụng và không gây HTTP 500.'
}, async ({ requestJson, withDatabase, deferCleanup }) => {
  const id = `ret313-${Date.now()}`;
  const code = `RET313${Date.now()}`;
  await withDatabase(db => db.run(
    `INSERT INTO coupons (id, code, discount, quantity, used_count, expired_date, status, usable_by, description, max_discount, min_order_amount)
     VALUES (?, ?, ?, ?, 0, ?, 'active', 'user', ?, 0, 0)`,
    [id, code, 10, 10, '2020-01-01', 'ORD-313 expired coupon']
  ));
  deferCleanup(() => withDatabase(db => db.run('DELETE FROM coupons WHERE id = ?', [id])));
  const res = await requestJson('/api/coupons/validate', {
    method: 'POST',
    body: { code, order_amount: 100000 }
  });
  assert.notEqual(res.status, 500, 'Expired coupon không được gây HTTP 500');
  assert.ok(res.status >= 400 || (res.body && res.body.valid === false), 'Coupon hết hạn phải bị từ chối');
  return `Expired coupon rejected with HTTP ${res.status}`;
});
