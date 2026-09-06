const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-319',
  title: '[Kiểm thử hồi quy] [Mua khóa học] Regression Test luồng tạo đơn hàng sau khi cập nhật hệ thống'
});

suite.scenario({
  id: 'TC_REG_319_01',
  name: 'Tạo đơn hàng với user hợp lệ và khóa học mẫu',
  inputs: 'User động; course đầu tiên; POST /api/orders',
  steps: ['Đăng ký user test.', 'Đăng nhập lấy JWT.', 'Lấy khóa học mẫu.', 'Tạo đơn hàng.', 'Kiểm tra orderId.', 'Dọn dữ liệu test.'],
  expected: 'Đơn hàng được tạo thành công, trả orderId và không HTTP 500.'
}, async ({ requestJson, login, uniqueUser, bearer, withDatabase, deferCleanup }) => {
  const user = uniqueUser('ord319');
  const register = await requestJson('/api/auth/register', { method: 'POST', body: user });
  assert.ok([200, 201].includes(register.status), `Register failed ${register.status}`);
  deferCleanup(() => withDatabase(async db => {
    const u = await db.get('SELECT id FROM users WHERE email = ?', [user.email]);
    if (!u) return;
    const orders = await db.all('SELECT id FROM orders WHERE user_id = ?', [u.id]);
    for (const o of orders) {
      await db.run('DELETE FROM order_details WHERE order_id = ?', [o.id]);
      await db.run('DELETE FROM affiliate_revenues WHERE order_id = ?', [o.id]);
      await db.run('DELETE FROM orders WHERE id = ?', [o.id]);
    }
    await db.run('DELETE FROM users WHERE id = ?', [u.id]);
  }));
  const auth = await login(user.email, user.password);
  assert.equal(auth.status, 200, 'Login user test thất bại');
  const courses = await requestJson('/api/courses');
  assert.equal(courses.status, 200);
  assert.ok(Array.isArray(courses.body) && courses.body.length > 0, 'Không có course mẫu');
  const c = courses.body[0];
  const price = Number(c.sale_price || c.price || 0);
  const order = await requestJson('/api/orders', {
    method: 'POST',
    headers: bearer(auth.body.token),
    body: {
      items: [{ course_id: c.id, product_name: c.title, price }],
      payment_method: 'bank_transfer',
      total: price
    }
  });
  assert.notEqual(order.status, 500, `Order HTTP 500: ${JSON.stringify(order.body)}`);
  assert.ok([200, 201].includes(order.status), `Create order failed ${order.status}: ${JSON.stringify(order.body)}`);
  assert.ok(order.body && (order.body.orderId || order.body.id), 'Không trả orderId');
  return `order=${order.body.orderId || order.body.id}; HTTP ${order.status}`;
});
