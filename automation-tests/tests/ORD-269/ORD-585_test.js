const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-585',
  title: '[Re-test] [Khóa học] Re-test GET /courses sort theo giá sau khi sửa lỗi thứ tự tăng/giảm'
});

function priceOf(c) {
  return Number(c.sale_price ?? c.price ?? 0);
}

suite.scenario({
  id: 'TC_RET_585_01',
  name: 'GET /courses sort price-asc tăng dần',
  inputs: 'GET /api/courses?sort_by=price-asc',
  steps: ['Gọi API sort tăng.', 'Lấy giá hiệu lực.', 'Kiểm tra từng cặp tăng dần.'],
  expected: 'Giá không giảm khi đi từ đầu đến cuối danh sách.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/courses?sort_by=price-asc');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  const p = res.body.map(priceOf);
  for (let i = 1; i < p.length; i++) assert.ok(p[i] >= p[i - 1], `Sai asc tại ${i}: ${p[i - 1]} > ${p[i]}`);
  return `verified ${p.length} prices asc`;
});

suite.scenario({
  id: 'TC_RET_585_02',
  name: 'GET /courses sort price-desc giảm dần',
  inputs: 'GET /api/courses?sort_by=price-desc',
  steps: ['Gọi API sort giảm.', 'Lấy giá hiệu lực.', 'Kiểm tra từng cặp giảm dần.'],
  expected: 'Giá không tăng khi đi từ đầu đến cuối danh sách.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/courses?sort_by=price-desc');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  const p = res.body.map(priceOf);
  for (let i = 1; i < p.length; i++) assert.ok(p[i] <= p[i - 1], `Sai desc tại ${i}: ${p[i - 1]} < ${p[i]}`);
  return `verified ${p.length} prices desc`;
});
