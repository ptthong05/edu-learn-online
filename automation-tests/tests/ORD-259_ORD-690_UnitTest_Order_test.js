/**
 * ==============================================================================
 * 📦 BỘ KIỂM THỬ GIAO DIỆN QUẢN LÝ ĐƠN HÀNG (CODECEPTJS E2E UI)
 * ==============================================================================
 * 📌 Story Jira: ORD-259 - [STORY 4.1] Phân hệ Đặt hàng & Quản trị đơn hàng
 * 📌 Subtask: ORD-690 - Kiểm thử giao diện Luồng Đặt hàng & Bảng Quản trị Đơn hàng
 * 🎯 Công cụ: CodeceptJS + Playwright (Trình duyệt tự động hóa)
 * 🔐 Tài khoản kiểm thử:
 *    - Admin: manager@edulearn.vn / admin123
 *    - Học viên: tuan.nguyen@gmail.com / user123
 * ==============================================================================
 */

Feature('ORD-690: [Kiểm thử giao diện] Luồng Đặt hàng & Bảng Quản trị Đơn hàng (Order Management UI Flow)');

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
 * Kịch bản 1: [UI-01] Học viên xem mục Đơn hàng trong trang Tài khoản cá nhân
 */
Scenario('ORD-690 [UI-01]: Học viên đăng nhập -> Mở /tai-khoan xem Lịch sử đơn hàng', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/tai-khoan');
  I.waitForText('Đơn hàng', 15);
  I.see('Đơn hàng');
});

/**
 * Kịch bản 2: [UI-02] Học viên tạo luồng Mua ngay sang trang Checkout
 */
Scenario('ORD-690 [UI-02]: Học viên bấm Mua ngay -> Kiểm tra chuyển sang trang /checkout?buynow=true', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/courses/course-1');
  I.waitForText('Mua ngay', 15);
  I.click('Mua ngay');
  I.waitInUrl('/checkout?buynow=true', 10);
  I.waitForText('Thanh toán', 15);
  I.see('Thanh toán');
});

/**
 * Kịch bản 3: [UI-03] Quản trị viên truy cập trang Quản lý Đơn hàng
 */
Scenario('ORD-690 [UI-03]: Admin đăng nhập -> Mở trang Quản lý Đơn hàng /admin/orders', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/orders');
  I.waitForText('Đơn CTV', 15);
  I.see('Đơn CTV');
});

/**
 * Kịch bản 4: [UI-04] Quản trị viên kiểm tra các bộ lọc đơn hàng
 */
Scenario('ORD-690 [UI-04]: Admin kiểm tra các tab & bộ lọc đơn hàng (Tất cả, CTV, ORD)', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/orders');
  I.waitForText('Quản lý Đơn hàng', 15);
  I.see('Tất cả');
  I.see('Đơn CTV');
});
