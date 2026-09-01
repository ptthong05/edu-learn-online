const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-316',
  title: '[Kiểm thử hồi quy] [Mã giảm giá] Re-test Coupon expired_date sau khi sửa so sánh ngày'
});

suite.scenario({
  id: 'TC_RET_316_01',
  name: 'Coupon đã hết hạn bị từ chối theo expired_date',
  inputs: 'Coupon tạm thời expired_date=2020-01-01',
  steps: ['Tạo coupon hết hạn.', 'Gọi /api/coupons/validate.', 'Kiểm tra bị từ chối.', 'Dọn coupon test.'],
  expected: 'Coupon hết hạn không hợp lệ và không gây HTTP 500.'
}, async ({ requestJson, withDatabase, deferCleanup }) => {
  const id = `ret316-${Date.now()}`;
  const code = `RET316${Date.now()}`;
  await withDatabase(db => db.run(
    `INSERT INTO coupons (id, code, discount, quantity, used_count, expired_date, status, usable_by, description, max_discount, min_order_amount)
     VALUES (?, ?, 10, 10, 0, '2020-01-01', 'active', 'user', 'ORD-316', 0, 0)`,
    [id, code]
  ));
  deferCleanup(() => withDatabase(db => db.run('DELETE FROM coupons WHERE id = ?', [id])));
  const res = await requestJson('/api/coupons/validate', {
    method: 'POST',
    body: { code, order_amount: 100000 }
  });
  assert.notEqual(res.status, 500);
  assert.ok(res.status >= 400 || (res.body && res.body.valid === false), 'Coupon hết hạn phải bị từ chối');
  return `expired coupon => HTTP ${res.status}`;
});
