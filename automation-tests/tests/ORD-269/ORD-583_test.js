const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-583',
  title: '[Re-test] [Xác thực] Re-test POST /register - email trùng sau khi sửa lỗi kiểm tra unique constraint'
});

suite.scenario({
  id: 'TC_RET_583_01',
  name: 'POST /register từ chối email đã tồn tại',
  inputs: 'Email user seed hiện có',
  steps: ['Lấy user có sẵn trong DB.', 'POST /api/auth/register với cùng email.', 'Kiểm tra bị từ chối và không HTTP 500.'],
  expected: 'HTTP 400/409; không tạo bản ghi user trùng.'
}, async ({ requestJson, withDatabase }) => {
  const existing = await withDatabase(db => db.get("SELECT email, phone FROM users WHERE role='USER' LIMIT 1"));
  assert.ok(existing, 'Không có USER seed để re-test email trùng');
  const res = await requestJson('/api/auth/register', {
    method: 'POST',
    body: {
      full_name: 'Duplicate Email Test',
      email: existing.email,
      phone: `09${String(Date.now()).slice(-8)}`,
      password: 'Test@1234'
    }
  });
  assert.notEqual(res.status, 500);
  assert.ok([400, 409].includes(res.status), `Expected 400/409, got ${res.status}`);
  return `duplicate email rejected=${res.status}`;
});
