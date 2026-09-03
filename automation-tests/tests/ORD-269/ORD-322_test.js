const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-322',
  title: '[Kiểm thử hồi quy] [Tiếp thị CTV] Regression Test Admin duyệt đơn và cộng hoa hồng CTV'
});

suite.scenario({
  id: 'TC_REG_322_01',
  name: 'API duyệt đơn chỉ cho phép tài khoản quản trị',
  inputs: 'PUT /api/admin/orders/:id/status không token',
  steps: ['Gọi API admin cập nhật trạng thái đơn không token.', 'Kiểm tra middleware từ chối.'],
  expected: 'HTTP 401/403; không thay đổi đơn và hoa hồng.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/admin/orders/non-existent/status', {
    method: 'PUT',
    body: { status: 'completed' }
  });
  assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
  return `admin order guard=${res.status}`;
});

suite.scenario({
  id: 'TC_REG_322_02',
  name: 'Cấu trúc dữ liệu hoa hồng CTV vẫn tồn tại sau cập nhật',
  inputs: 'SQLite affiliate_revenues và affiliate_commissions',
  steps: ['Kiểm tra bảng affiliate_revenues.', 'Kiểm tra bảng affiliate_commissions.', 'Kiểm tra các cột commission chính.'],
  expected: 'Schema phục vụ cộng hoa hồng CTV còn đầy đủ.'
}, async ({ withDatabase }) => {
  return withDatabase(async db => {
    const revCols = await db.all("PRAGMA table_info('affiliate_revenues')");
    const comCols = await db.all("PRAGMA table_info('affiliate_commissions')");
    const rev = new Set(revCols.map(c => c.name));
    const com = new Set(comCols.map(c => c.name));
    for (const col of ['affiliate_id', 'order_id', 'commission_amount', 'status']) assert.ok(rev.has(col), `affiliate_revenues thiếu ${col}`);
    for (const col of ['course_id', 'commission_rate']) assert.ok(com.has(col), `affiliate_commissions thiếu ${col}`);
    return `affiliate_revenues=${revCols.length} cols; affiliate_commissions=${comCols.length} cols`;
  });
});
