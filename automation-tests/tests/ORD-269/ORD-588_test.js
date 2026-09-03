const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-588',
  title: '[Regression] [Khóa học] [REG-003] Regression Courses API sau khi thêm trường mới vào schema'
});

suite.scenario({
  id: 'TC_REG_588_01',
  name: 'Courses API giữ các field cốt lõi sau thay đổi schema',
  inputs: 'GET /api/courses',
  steps: ['Gọi Courses API.', 'Kiểm tra array.', 'Kiểm tra id, title, price trên từng course.'],
  expected: 'Các field cũ vẫn tồn tại, không phá backward compatibility.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/courses');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0, 'Không có course để kiểm tra schema');
  for (const c of res.body) {
    assert.ok(c.id, 'Thiếu id');
    assert.ok(c.title, 'Thiếu title');
    assert.ok(Object.prototype.hasOwnProperty.call(c, 'price'), 'Thiếu price');
  }
  return `verified ${res.body.length} courses`;
});

suite.scenario({
  id: 'TC_REG_588_02',
  name: 'Các trường schema mới không làm API trả HTTP 500',
  inputs: 'GET /api/courses và GET /api/courses/:id',
  steps: ['Lấy danh sách khóa học.', 'Mở chi tiết khóa học đầu tiên.', 'Kiểm tra không HTTP 500.'],
  expected: 'List/detail Courses API ổn định sau migration schema.'
}, async ({ requestJson }) => {
  const list = await requestJson('/api/courses');
  assert.equal(list.status, 200);
  assert.ok(list.body.length > 0);
  const detail = await requestJson(`/api/courses/${list.body[0].id}`);
  assert.equal(detail.status, 200);
  assert.notEqual(detail.status, 500);
  return `list=${list.status}; detail=${detail.status}`;
});
