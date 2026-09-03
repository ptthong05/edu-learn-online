const assert = require('node:assert/strict');

const {
  createJiraSuite
} = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-311',
  title:
    '[UAT-Alpha] Kiểm thử chấp nhận Alpha nội bộ với dữ liệu mẫu'
});

suite.scenario(
  {
    id: 'TC_UAT_311_01',
    name: 'Backend và dữ liệu mẫu sẵn sàng',

    inputs:
      'GET /api/health và GET /api/courses',

    steps: [
      'Gọi API kiểm tra sức khỏe Backend.',
      'Lấy danh sách khóa học.',
      'Kiểm tra HTTP status.',
      'Kiểm tra cấu trúc dữ liệu cơ bản.'
    ],

    expected:
      'HTTP 200, health=ok và có ít nhất một khóa học mẫu.'
  },

  async ({ requestJson }) => {
    const health = await requestJson('/api/health');
    const courses = await requestJson('/api/courses');

    assert.equal(
      health.status,
      200,
      'Health API phải trả HTTP 200'
    );

    assert.equal(
      health.body.status,
      'ok',
      'Health status phải bằng ok'
    );

    assert.equal(
      courses.status,
      200,
      'Courses API phải trả HTTP 200'
    );

    assert.ok(
      Array.isArray(courses.body),
      'Courses response phải là array'
    );

    assert.ok(
      courses.body.length > 0,
      'Phải có ít nhất một khóa học mẫu'
    );

    assert.ok(
      courses.body.every(
        course => course.id && course.title
      ),
      'Mỗi course phải có id và title'
    );

    return (
      `health=ok; courses=${courses.body.length}; ` +
      'không có HTTP 500.'
    );
  }
);

suite.scenario(
  {
    id: 'TC_UAT_311_02',
    name:
      'Trang chủ và danh sách khóa học hiển thị',

    inputs:
      'Frontend / và /courses; desktop 1280x900',

    steps: [
      'Mở trang chủ.',
      'Kiểm tra phần Khóa học nổi bật.',
      'Chụp ảnh trang chủ.',
      'Mở trang danh sách khóa học.',
      'Kiểm tra nội dung và chụp ảnh.'
    ],

    expected:
      'Hai trang tải thành công, hiển thị nội dung khóa học và không có Application error.',

    evidence:
      'ORD-311-homepage.png, ORD-311-courses.png và ảnh Terminal'
  },

  async ({ I }) => {
    await I.resizeWindow(1280, 900);

    await I.amOnPage('/');

    await I.waitForText(
      'Khóa học nổi bật',
      20
    );

    await I.dontSee('Application error');

    await I.saveScreenshot(
      'ORD-311-homepage.png',
      true
    );

    await I.amOnPage('/courses');

    await I.waitForText(
      'Tất cả khóa học',
      20
    );

    await I.waitForText(
      'Tìm thấy',
      20
    );

    await I.dontSee('Application error');

    await I.saveScreenshot(
      'ORD-311-courses.png',
      true
    );

    return (
      'Trang chủ và trang /courses ' +
      'hiển thị thành công.'
    );
  }
);

suite.scenario(
  {
    id: 'TC_UAT_311_03',
    name:
      'Manager đăng nhập bằng dữ liệu mẫu',

    inputs:
      'Tài khoản Manager được seed trong dự án',

    steps: [
      'Mở trang đăng nhập.',
      'Xóa phiên đăng nhập cũ.',
      'Nhập email và mật khẩu Manager.',
      'Nhấn Đăng nhập.',
      'Kiểm tra trang Admin Dashboard.',
      'Chụp ảnh bằng chứng.'
    ],

    expected:
      'Đăng nhập thành công, chuyển đến Admin Dashboard và không có lỗi tải số liệu.',

    evidence:
      'ORD-311-manager-dashboard.png và ảnh Terminal'
  },

  async ({ I, credentials }) => {
    await I.amOnPage('/login');

    await I.executeScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await I.refreshPage();

    await I.fillField(
      'input[type="email"]',
      credentials.manager.email
    );

    await I.fillField(
      'input[type="password"]',
      credentials.manager.password
    );

    await I.click(
      'button[type="submit"]'
    );

    await I.waitInUrl(
      '/admin',
      20
    );

    await I.waitForText(
      'Tổng quan hệ thống',
      20
    );

    await I.dontSee(
      'Lỗi khi tải số liệu'
    );

    await I.saveScreenshot(
      'ORD-311-manager-dashboard.png',
      true
    );

    return (
      'Manager đăng nhập và mở ' +
      'Dashboard thành công.'
    );
  }
);