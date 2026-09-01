const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-312',
  title: '[UAT-Beta] Người dùng thực tế trải nghiệm trên môi trường Staging'
});


suite.scenario({
  id: 'TC_UAT_312_01',
  name: 'Smoke test các trang chính trên môi trường Beta/Staging',
  inputs: 'Frontend /, /courses và Backend /api/health',
  steps: ['Kiểm tra Backend.', 'Mở trang chủ.', 'Mở danh sách khóa học.', 'Kiểm tra không có Application error.'],
  expected: 'Backend HTTP 200; các trang chính tải được và không có lỗi ứng dụng.'
}, async ({ I, requestJson }) => {
  const health = await requestJson('/api/health');
  assert.equal(health.status, 200);
  I.amOnPage('/');
  I.waitForText('Khám phá ngay', 15);
  I.dontSee('Application error');
  I.amOnPage('/courses');
  I.wait(2);
  I.dontSee('Application error');
  return 'Beta/Staging smoke flow hoạt động.';
});

suite.scenario({
  id: 'TC_UAT_312_02',
  name: 'Đăng nhập người dùng trên Beta/Staging',
  inputs: 'Tài khoản user được cấu hình trong SP.js',
  steps: ['Mở /login.', 'Nhập tài khoản user.', 'Đăng nhập.', 'Xác nhận không còn ở trang /login.'],
  expected: 'Người dùng đăng nhập thành công.'
}, async ({ I, credentials }) => {
  I.amOnPage('/login');
  I.waitForText('Đăng nhập tài khoản', 15);
  I.fillField('input[type="email"]', credentials.user.email);
  I.fillField('input[type="password"]', credentials.user.password);
  I.click('button[type="submit"]');
  I.wait(3);
  I.dontSeeInCurrentUrl('/login');
  return `User ${credentials.user.email} đăng nhập thành công.`;
});
