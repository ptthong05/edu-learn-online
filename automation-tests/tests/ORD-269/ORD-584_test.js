const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-584',
  title: '[Re-test] [Xác thực] Re-test POST /login - báo lỗi sai password sau khi sửa logic so sánh hash'
});

suite.scenario({
  id: 'TC_RET_584_01',
  name: 'POST /login trả lỗi khi mật khẩu sai',
  inputs: 'Manager email hợp lệ + password sai',
  steps: ['Gửi login với email hợp lệ.', 'Dùng password sai.', 'Kiểm tra HTTP 400/401 và message lỗi.'],
  expected: 'Sai mật khẩu bị từ chối, không HTTP 500.'
}, async ({ login, credentials }) => {
  const res = await login(credentials.manager.email, 'SaiMatKhau@999');
  assert.notEqual(res.status, 500);
  assert.ok([400, 401, 403].includes(res.status), `Expected 400/401/403, got ${res.status}`);
  assert.ok(res.body && res.body.message, 'Thiếu thông báo lỗi');
  return `wrong password rejected=${res.status}; message=${res.body.message}`;
});

suite.scenario({
  id: 'TC_RET_584_02',
  name: 'Password trong DB vẫn là hash, không phải plaintext',
  inputs: 'Manager seed trong users',
  steps: ['Đọc password lưu trong DB.', 'So sánh với password plaintext.', 'Kiểm tra độ dài hash.'],
  expected: 'Password không lưu plaintext.'
}, async ({ withDatabase, credentials }) => {
  const row = await withDatabase(db => db.get('SELECT password FROM users WHERE email = ?', [credentials.manager.email]));
  assert.ok(row && row.password, 'Không tìm thấy password');
  assert.notEqual(row.password, credentials.manager.password, 'Password đang lưu plaintext');
  assert.ok(String(row.password).length >= 20, 'Hash password quá ngắn');
  return `hashLength=${String(row.password).length}`;
});
