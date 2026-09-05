/**
 * ==============================================================================
 * 🤝 BỘ KIỂM THỬ GIAO DIỆN TIẾP THỊ LIÊN KẾT CTV (CODECEPTJS E2E UI)
 * ==============================================================================
 * 📌 Story Jira: ORD-263 - [STORY 5.1] Phân hệ Tiếp thị liên kết (Affiliate / CTV)
 * 📌 Subtask: ORD-714 -> ORD-723 - Luồng Quản lý & Vận hành Đối tác CTV
 * 🎯 Công cụ: CodeceptJS + Playwright (Trình duyệt tự động hóa)
 * 🔐 Tài khoản kiểm thử:
 *    - Admin: manager@edulearn.vn / admin123
 *    - Học viên: tuan.nguyen@gmail.com / user123
 * ==============================================================================
 */

Feature('ORD-263: [Kiểm thử giao diện] Phân hệ Tiếp thị liên kết Affiliate CTV (Affiliate UI Flow)');

/**
 * Helper: Đăng nhập tài khoản Học viên hợp lệ trong CSDL
 */
const loginAsStudent = (I) => {
  I.amOnPage('/login');
  I.waitForText('Đăng nhập tài khoản', 10);
  I.fillField('input[type="email"]', 'tuan.nguyen@gmail.com');
  I.fillField('input[type="password"]', 'user123');
  I.click('Đăng nhập');
  I.wait(3);
};

/**
 * Helper: Đăng nhập tài khoản Admin hợp lệ trong CSDL
 */
const loginAsAdmin = (I) => {
  I.amOnPage('/login');
  I.waitForText('Đăng nhập tài khoản', 10);
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('Đăng nhập');
  I.wait(3);
};

/**
 * Kịch bản 1: [UI-01] Người dùng xem trang giới thiệu chính sách Affiliate
 */
Scenario('ORD-263 [UI-01]: Học viên mở /tai-khoan xem thông tin Chương trình Tiếp thị liên kết', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/tai-khoan');
  I.waitForText('Chương trình tiếp thị liên kết', 15);
  I.see('Chương trình tiếp thị liên kết');
});

/**
 * Kịch bản 2: [UI-02] Học viên xem thông tin CTV trong trang Tài khoản cá nhân
 */
Scenario('ORD-263 [UI-02]: Học viên đăng nhập -> Mở /tai-khoan xem Tab Tiếp thị liên kết', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/tai-khoan');
  I.waitForText('Chương trình tiếp thị liên kết', 15);
  I.see('Chương trình tiếp thị liên kết');
});

/**
 * Kịch bản 3: [UI-03] Khách hàng mở link tiếp thị giới thiệu của CTV (?ref=CTV001)
 */
Scenario('ORD-263 [UI-03]: Truy cập liên kết gắn mã tiếp thị CTV ?ref=CTV001', async ({ I }) => {
  I.amOnPage('/courses/course-1?ref=CTV001');
  I.waitForText('Mua ngay', 15);
  I.see('Mua ngay');
});

/**
 * Kịch bản 4: [UI-04] Quản trị viên truy cập trang Quản lý Đối tác Affiliate
 */
Scenario('ORD-263 [UI-04]: Admin đăng nhập -> Vào trang Quản lý Đối tác CTV /admin/affiliates', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/affiliates');
  I.waitForText('Quản lý', 15);
});
