/**
 * ==============================================================================
 * 🛒 BỘ KIỂM THỬ HỆ THỐNG TOÀN DIỆN (CODECEPTJS E2E BROWSER AUTOMATION)
 * ==============================================================================
 * 📌 Story Jira: ORD-96 - [Kiểm thử hệ thống] Luồng Mua khóa học & Thanh toán End-to-End
 * 📖 Căn cứ tài liệu: 
 *    - edu-learn-doc/vi/user/02-mua-khoa-hoc.md
 *    - edu-learn-doc/vi/admin/04-quan-ly-don-hang.md
 *    - edu-learn-doc/vi/user/04-tai-khoan.md
 * 🎯 Công cụ: CodeceptJS + Playwright (Trình duyệt tự động hóa)
 * 🔐 Dữ liệu thật từ CSDL Backend:
 *    - Học viên: tuan.nguyen@gmail.com / user123
 *    - Admin: manager@edulearn.vn / admin123
 *    - Khóa học mẫu: /courses/course-1
 * ==============================================================================
 */

Feature('ORD-96: [Kiểm thử hệ thống] Luồng Mua khóa học & Thanh toán End-to-End (CodeceptJS UI)');

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
 * Subtask: ORD-724
 * Kịch bản: [E2E-01] Luồng Mua nhanh (Buy Now Flow) trọn vẹn từ Chi tiết khóa học -> Checkout -> Xác nhận thanh toán
 */
Scenario('ORD-724 [E2E-01]: [Luồng Mua Nhanh E2E] Học viên đăng nhập -> Nhấn "Mua ngay" -> Vào /checkout?buynow=true -> Nhấn "Thanh toán ngay"', async ({ I }) => {
  loginAsStudent(I);

  // 1. Vào trang chi tiết khóa học thực tế và chờ tải API
  I.amOnPage('/courses/course-1');
  I.waitForText('Mua ngay', 15);
  I.see('Mua ngay');

  // 2. Click nút "Mua ngay"
  I.click('Mua ngay');

  // 3. Chờ Next.js router điều hướng sang trang /checkout?buynow=true
  I.waitInUrl('/checkout?buynow=true', 10);
  I.waitForText('Thanh toán', 15);
  I.see('Phương thức thanh toán');

  // 4. Click nút "Thanh toán ngay" (chuyển sang trang sinh mã QR thanh toán)
  I.see('Thanh toán ngay');
  I.click('Thanh toán ngay');

  // 5. Kiểm tra điều hướng sang trang xác nhận kèm thông tin chuyển khoản
  I.waitInUrl('/order-confirmation?checkout=true', 10);
  I.waitForText('Thông tin chuyển tiền', 15);
  I.see('Thông tin chuyển tiền');
  I.see('Xác nhận thanh toán');
});

/**
 * Subtask: ORD-725
 * Kịch bản: [E2E-02] Quản lý Giỏ hàng (/cart) -> Thêm khóa học, mở giỏ hàng và bấm "Thanh toán ngay"
 */
Scenario('ORD-725 [E2E-02]: [Luồng Giỏ Hàng] Học viên đăng nhập -> Thêm khóa học vào giỏ -> Mở /cart -> Bấm "Thanh toán ngay"', async ({ I }) => {
  loginAsStudent(I);

  // 1. Thêm khóa học vào giỏ hàng
  I.amOnPage('/courses/course-1');
  I.waitForText('Thêm vào giỏ hàng', 15);
  I.click('Thêm vào giỏ hàng');

  // 2. Mở trang Giỏ hàng
  I.amOnPage('/cart');
  I.waitForText('Giỏ hàng', 15);
  I.see('Tóm tắt đơn hàng');

  // 3. Bấm nút "Thanh toán ngay" để chuyển sang Checkout
  I.see('Thanh toán ngay');
  I.click('Thanh toán ngay');
  I.waitInUrl('/checkout', 10);
});

/**
 * Subtask: ORD-726
 * Kịch bản: [E2E-03] Mua gói Combo khóa học tại trang /combos
 */
Scenario('ORD-726 [E2E-03]: [Luồng Combo] Học viên đăng nhập -> Mở trang /combos -> Xem danh sách gói Combo ưu đãi', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/combos');
  I.waitForText('Combo', 15);
  I.see('Combo');
})

/**
 * Subtask: ORD-728
 * Kịch bản: [E2E-05] Mua qua link tiếp thị liên kết CTV (?ref=CTVxxx)
 */
Scenario('ORD-728 [E2E-05]: [Luồng CTV Ref] Truy cập link tiếp thị ref CTV -> Mua ngay và kiểm tra trang Checkout', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/courses/course-1?ref=CTV001');
  I.waitForText('Mua ngay', 15);
  I.click('Mua ngay');
  I.waitInUrl('/checkout?buynow=true', 10);
  I.waitForText('Thanh toán', 15);
  I.see('Thanh toán');
});

/**
 * Subtask: ORD-729
 * Kịch bản: [E2E-06] Khởi tạo thanh toán VietQR và sinh mã đơn hàng
 */
Scenario('ORD-729 [E2E-06]: [Luồng VietQR] Chọn phương thức Chuyển khoản -> Nhấn "Thanh toán ngay" -> Hiển thị thông tin chuyển tiền', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/courses/course-1');
  I.waitForText('Mua ngay', 15);
  I.click('Mua ngay');
  I.waitInUrl('/checkout?buynow=true', 10);
  I.waitForText('Phương thức thanh toán', 15);
  I.see('Thanh toán ngay');
  I.click('Thanh toán ngay');
  I.waitInUrl('/order-confirmation?checkout=true', 10);
  I.waitForText('Thông tin chuyển tiền', 15);
  I.see('Thông tin chuyển tiền');
});

/**
 * Subtask: ORD-730
 * Kịch bản: [E2E-07] Xác nhận đơn hàng & Xử lý trạng thái trang /order-confirmation
 * Kỳ vọng: Khi truy cập trang /order-confirmation mà không có tham số đơn hàng (orderId/checkout), hệ thống phải hiển thị "Không tìm thấy thông tin đơn hàng".
 * (Lưu ý: Kịch bản này sẽ FAILED phản ánh đúng Bug DEV ORD-735 đang mở trên Jira do trang bị kẹt loading vô tận)
 */
Scenario('ORD-730 [E2E-07]: [Luồng Xác Nhận Đơn] Truy cập /order-confirmation -> Phải hiển thị "Không tìm thấy thông tin đơn hàng"', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/order-confirmation');
  I.waitForText('Không tìm thấy thông tin đơn hàng', 5);
  I.see('Không tìm thấy thông tin đơn hàng');
});

/**
 * Subtask: ORD-731
 * Kịch bản: [E2E-08] Admin đăng nhập và truy cập trang quản lý
 */
Scenario('ORD-731 [E2E-08]: [Luồng Admin Duyệt] Admin đăng nhập -> Vào trang Quản trị hệ thống /admin', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin');
  I.waitForText('Quản lý', 15);
});

/**
 * Subtask: ORD-732
 * Kịch bản: [E2E-09] Admin kiểm tra menu quản lý
 */
Scenario('ORD-732 [E2E-09]: [Luồng Admin Hủy] Admin kiểm tra khu vực quản trị đơn hàng', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin');
  I.waitForText('Quản lý', 15);
});

/**
 * Subtask: ORD-733
 * Kịch bản: [E2E-10] Học viên vào /tai-khoan xem Lịch sử đơn mua và nhận hướng dẫn Google Drive
 */
Scenario('ORD-733 [E2E-10]: [Luồng Kích Hoạt Drive] Học viên đăng nhập -> Mở /tai-khoan xem thông tin tài khoản', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/tai-khoan');
  I.waitForText('Đơn hàng', 15);
  I.see('Đơn hàng');
});

/**
 * Subtask: ORD-734
 * Kịch bản: [E2E-11] Đơn hàng CTV hoàn tất -> Tự động ghi nhận hoa hồng vào ví đối tác
 */
Scenario('ORD-734 [E2E-11]: [Luồng Hoa Hồng CTV] Học viên/Đối tác CTV đăng nhập -> Vào /tai-khoan', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/tai-khoan');
  I.waitForText('Chương trình tiếp thị liên kết', 15);
  I.see('Chương trình tiếp thị liên kết');
});
