const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-314',
  title: '[Kiểm thử hồi quy] [Hệ thống] [Regression] Chạy tự động toàn bộ Test Suite đảm bảo không lỗi phát sinh'
});

suite.scenario({
  id: 'TC_REG_314_01',
  name: 'Regression API nền tảng',
  inputs: 'GET /api/health, /api/courses, /api/categories, /api/combos',
  steps: ['Gọi lần lượt API nền tảng.', 'Kiểm tra HTTP status.', 'Đảm bảo không HTTP 500.'],
  expected: 'Các API nền tảng phản hồi thành công và không có lỗi server.'
}, async ({ requestJson }) => {
  const routes = ['/api/health', '/api/courses', '/api/categories', '/api/combos'];
  const result = [];
  for (const route of routes) {
    const res = await requestJson(route);
    assert.notEqual(res.status, 500, `${route} bị HTTP 500`);
    assert.ok(res.status >= 200 && res.status < 400, `${route} trả ${res.status}`);
    result.push(`${route}:${res.status}`);
  }
  return result.join('; ');
});

suite.scenario({
  id: 'TC_REG_314_02',
  name: 'Regression UI các trang chính',
  inputs: 'Trang /, /courses, /login',
  steps: ['Mở từng trang chính.', 'Kiểm tra không Application error.'],
  expected: 'Các trang chính tải được, không phát sinh lỗi ứng dụng.'
}, async ({ I }) => {
  for (const route of ['/', '/courses', '/login']) {
    I.amOnPage(route);
    I.wait(1);
    I.dontSee('Application error');
  }
  return 'UI regression smoke hoàn tất.';
});

suite.scenario({
  id: 'TC_REG_314_03',
  name: 'Regression xác thực cơ bản',
  inputs: 'Manager hợp lệ và mật khẩu sai',
  steps: ['Login hợp lệ.', 'Login sai mật khẩu.', 'Kiểm tra kết quả.'],
  expected: 'Login hợp lệ thành công; mật khẩu sai bị từ chối.'
}, async ({ login, credentials }) => {
  const ok = await login(credentials.manager.email, credentials.manager.password);
  const bad = await login(credentials.manager.email, 'Wrong@12345');
  assert.equal(ok.status, 200);
  assert.ok([400, 401, 403].includes(bad.status));
  return `valid=${ok.status}; invalid=${bad.status}`;
});
