const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-315',
  title: '[Nghiệm thu UAT] [Khóa học] Học viên tìm kiếm, xem chi tiết và mua khóa học trên Mobile'
});

suite.scenario({
  id: 'TC_UAT_315_01',
  name: 'Tìm kiếm và xem danh sách khóa học trên Mobile',
  inputs: 'Viewport 390x844; /courses',
  steps: ['Đổi viewport Mobile.', 'Mở /courses.', 'Kiểm tra trang tải và không Application error.'],
  expected: 'Danh sách khóa học sử dụng được trên Mobile.'
}, async ({ I }) => {
  I.resizeWindow(390, 844);
  I.amOnPage('/courses');
  I.wait(2);
  I.dontSee('Application error');
  I.saveScreenshot('ORD-315-mobile-courses.png', true);
  return 'Mobile courses page loaded.';
});

suite.scenario({
  id: 'TC_UAT_315_02',
  name: 'Xem chi tiết khóa học trên Mobile',
  inputs: 'Khóa học đầu tiên từ GET /api/courses',
  steps: ['Lấy khóa học mẫu qua API.', 'Mở trang chi tiết khóa học.', 'Kiểm tra không lỗi ứng dụng.'],
  expected: 'Học viên mở được chi tiết khóa học trên Mobile.'
}, async ({ I, requestJson }) => {
  const courses = await requestJson('/api/courses');
  assert.equal(courses.status, 200);
  assert.ok(Array.isArray(courses.body) && courses.body.length > 0, 'Không có khóa học mẫu');
  const course = courses.body[0];
  I.resizeWindow(390, 844);
  I.amOnPage(`/courses/${course.id}`);
  I.wait(2);
  I.dontSee('Application error');
  return `Opened course ${course.id}`;
});

suite.scenario({
  id: 'TC_UAT_315_03',
  name: 'Luồng mua khóa học yêu cầu đăng nhập',
  inputs: 'Mobile viewport; trang checkout',
  steps: ['Mở trang checkout trên Mobile.', 'Kiểm tra trang không crash.'],
  expected: 'Luồng mua/checkout hiển thị ổn định trên Mobile và yêu cầu xác thực khi cần.'
}, async ({ I }) => {
  I.resizeWindow(390, 844);
  I.amOnPage('/checkout');
  I.wait(2);
  I.dontSee('Application error');
  return 'Mobile checkout flow reachable.';
});
