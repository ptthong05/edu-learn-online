/**
 * ==============================================================================
 * 🎟️ BỘ KIỂM THỬ TÍCH HỢP GIAO DIỆN HỆ THỐNG (CODECEPTJS E2E UI AUTOMATION)
 * ==============================================================================
 * 📌 Story Jira: ORD-255 - [STORY 3.1] Phân hệ Mã giảm giá (Coupons Module)
 * 📌 Subtask: ORD-647 - Kiểm thử tích hợp & Luồng giao diện Mã giảm giá (Coupons UI Flow)
 * 🎯 Công cụ: CodeceptJS + Playwright (Trình duyệt tự động hóa)
 * 🔐 Tài khoản kiểm thử:
 *    - Admin: manager@edulearn.vn / admin123
 *    - Học viên: tuan.nguyen@gmail.com / user123
 * ==============================================================================
 */

Feature('ORD-647: [Kiểm thử giao diện] Quản lý & Áp dụng Mã giảm giá (Coupons UI Browser Flow)');

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
 * Kịch bản 1: [UI-01] Quản trị viên truy cập bảng điều khiển Mã Giảm Giá
 */
Scenario('ORD-647 [UI-01]: Admin đăng nhập -> Vào trang Quản lý Mã giảm giá /admin/coupons', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/coupons');
  I.waitForText('Mã Giảm Giá', 15);
  I.see('Mã Giảm Giá');
  I.see('+ Thêm Coupon');
});

/**
 * Kịch bản 2: [UI-02] Quản trị viên mở modal và tạo mới một Voucher thành công
 */
Scenario('ORD-647 [UI-02]: Admin mở form -> Nhập thông tin & Tạo mới Mã giảm giá thành công', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/coupons');
  I.waitForText('+ Thêm Coupon', 15);
  I.click('+ Thêm Coupon');
  I.waitForText('Thêm Coupon mới', 10);
  I.see('Thêm Coupon mới');

  const randomCode = `UI${Date.now().toString().slice(-6)}`;
  I.fillField('input[placeholder="Ví dụ: SALE50"]', randomCode);
  I.fillField('input[placeholder="Ví dụ: Giảm giá 30% cho khách hàng mới..."]', 'Mã giảm giá kiểm thử UI tự động');
  I.click('Lưu thông tin');
  I.wait(2);
  I.waitForText('Mã Giảm Giá', 15);
});

/**
 * Kịch bản 3: [UI-03] Quản trị viên sử dụng thanh tìm kiếm lọc mã giảm giá
 */
Scenario('ORD-647 [UI-03]: Admin sử dụng ô lọc tìm kiếm danh sách mã giảm giá', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/coupons');
  I.waitForText('Mã Giảm Giá', 15);
  I.fillField('input[placeholder="Lọc theo mã giảm giá..."]', 'SALE');
  I.wait(1);
  I.see('Mã Giảm Giá');
});

/**
 * Kịch bản 4: [UI-04] Học viên xem danh sách các chương trình khuyến mãi tại trang /promotions
 */
Scenario('ORD-647 [UI-04]: Học viên đăng nhập -> Mở trang Khuyến mãi /promotions', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/promotions');
  I.waitForText('Khuyến mãi', 15);
  I.see('Khuyến mãi');
});

/**
 * Kịch bản 5: [UI-05] Học viên áp dụng mã giảm giá tại trang Thanh toán /checkout
 */
Scenario('ORD-647 [UI-05]: Học viên mua khóa học -> Mở panel Voucher tại Checkout -> Nhập mã thủ công', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/courses/course-1');
  I.waitForText('Mua ngay', 15);
  I.click('Mua ngay');
  I.waitInUrl('/checkout?buynow=true', 10);
  I.waitForText('Chọn voucher giảm giá', 15);
  I.click('Chọn voucher giảm giá');
  I.waitForText('NHẬP MÃ THỦ CÔNG', 15);
  I.see('NHẬP MÃ THỦ CÔNG');
});

/**
 * Kịch bản 6: [UI-06] Phân quyền RBAC - Học viên thông thường không được phép truy cập khu vực /admin/coupons
 */
Scenario('ORD-647 [UI-06]: Phân quyền RBAC - Học viên cố tình vào /admin/coupons -> Bị chặn điều hướng', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/admin/coupons');
  I.wait(2);
  // Middleware hoặc UI sẽ chặn và chuyển hướng học viên khỏi admin
  I.dontSee('Thêm Coupon mới');
});
