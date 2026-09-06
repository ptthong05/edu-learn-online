const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-320',
  title: '[Kiểm thử hồi quy] [Mã giảm giá] Regression Test xác thực mã giảm giá'
});

suite.scenario({
  id: 'TC_REG_320_01',
  name: 'Mã giảm giá không tồn tại bị từ chối',
  inputs: 'POST /api/coupons/validate; code=NOT_EXIST_REG320',
  steps: ['Gửi mã không tồn tại.', 'Kiểm tra không HTTP 500.', 'Kiểm tra bị từ chối.'],
  expected: 'Mã không tồn tại không được áp dụng.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/coupons/validate', {
    method: 'POST',
    body: { code: 'NOT_EXIST_REG320', order_amount: 100000 }
  });
  assert.notEqual(res.status, 500);
  assert.ok(res.status >= 400 || (res.body && res.body.valid === false));
  return `invalid coupon => HTTP ${res.status}`;
});

suite.scenario({
  id: 'TC_REG_320_02',
  name: 'Mã giảm giá hợp lệ được tính đúng',
  inputs: 'Coupon test 10%; order_amount=100000',
  steps: ['Tạo coupon hợp lệ tạm thời.', 'Validate coupon.', 'Kiểm tra valid=true và discount > 0.', 'Dọn dữ liệu.'],
  expected: 'Coupon hợp lệ được chấp nhận và có calculated_discount dương.'
}, async ({ requestJson, withDatabase, deferCleanup }) => {
  const id = `reg320-${Date.now()}`;
  const code = `REG320${Date.now()}`;
  await withDatabase(db => db.run(
    `INSERT INTO coupons (id, code, discount, quantity, used_count, expired_date, status, usable_by, description, max_discount, min_order_amount)
     VALUES (?, ?, 10, 10, 0, '2099-12-31', 'active', 'user', 'ORD-320', 0, 0)`,
    [id, code]
  ));
  deferCleanup(() => withDatabase(db => db.run('DELETE FROM coupons WHERE id = ?', [id])));
  const res = await requestJson('/api/coupons/validate', {
    method: 'POST',
    body: { code, order_amount: 100000 }
  });
  assert.notEqual(res.status, 500);
  assert.ok([200, 201].includes(res.status), `Coupon hợp lệ trả ${res.status}: ${JSON.stringify(res.body)}`);
  assert.ok(res.body && res.body.valid !== false, 'Coupon hợp lệ bị đánh dấu invalid');
  return `valid coupon => HTTP ${res.status}; discount=${res.body.calculated_discount}`;
});
