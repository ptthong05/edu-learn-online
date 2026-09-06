const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-587',
  title: '[Regression] [Xác thực] [REG-002] Regression Auth sau khi update middleware xử lý JWT token'
});

suite.scenario({
  id: 'TC_REG_587_01',
  name: 'Middleware chặn request không có JWT',
  inputs: 'GET /api/admin/stats không Authorization',
  steps: ['Gọi API admin không token.', 'Kiểm tra bị từ chối.'],
  expected: 'HTTP 401/403.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/admin/stats');
  assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
  return `no-token rejected=${res.status}`;
});

suite.scenario({
  id: 'TC_REG_587_02',
  name: 'Middleware chặn JWT hết hạn',
  inputs: 'Expired JWT',
  steps: ['Sinh token hết hạn.', 'Gọi API admin.', 'Kiểm tra bị từ chối.'],
  expected: 'HTTP 401/403.'
}, async ({ requestJson, expiredToken, bearer }) => {
  const res = await requestJson('/api/admin/stats', { headers: bearer(expiredToken()) });
  assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
  return `expired-token rejected=${res.status}`;
});

suite.scenario({
  id: 'TC_REG_587_03',
  name: 'JWT hợp lệ của Manager truy cập API quản trị',
  inputs: 'Manager valid JWT',
  steps: ['Login Manager.', 'Gọi /api/admin/stats với Bearer token.', 'Kiểm tra không bị 401/403.'],
  expected: 'JWT hợp lệ được middleware chấp nhận.'
}, async ({ login, credentials, requestJson, bearer }) => {
  const auth = await login(credentials.manager.email, credentials.manager.password);
  assert.equal(auth.status, 200);
  const res = await requestJson('/api/admin/stats', { headers: bearer(auth.body.token) });
  assert.notEqual(res.status, 401);
  assert.notEqual(res.status, 403);
  assert.notEqual(res.status, 500);
  return `valid-token admin stats=${res.status}`;
});
