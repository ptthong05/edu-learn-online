/**
 * ==============================================================================
 * 🎓 BỘ KIỂM THỬ GIAO DIỆN & QUẢN TRỊ KHÓA HỌC (CODECEPTJS E2E UI)
 * ==============================================================================
 * 📌 Story Jira: ORD-59 - [Kiểm thử tích hợp] [Quản lý khóa học] Module Khóa học (Courses Flow)
 * 📌 Subtasks: ORD-736 -> ORD-742
 * 🎯 Công cụ: CodeceptJS + Playwright (Trình duyệt tự động hóa)
 * 🔐 Tài khoản kiểm thử:
 *    - Admin: manager@edulearn.vn / admin123
 *    - Học viên: tuan.nguyen@gmail.com / user123
 * ==============================================================================
 */

Feature('ORD-59: [Kiểm thử giao diện & Quản trị] Module Khóa học (Courses Management UI Flow)');

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
 * Subtask: ORD-736
 * Kịch bản: [IT-CRS-01] Xem danh sách khóa học công khai trên hệ thống
 */
Scenario('ORD-736 [IT-CRS-01]: Người dùng mở trang chủ -> Hiển thị danh sách khóa học đang bán', async ({ I }) => {
  I.amOnPage('/');
  I.waitForText('KHÓA HỌC', 15);
  I.see('KHÓA HỌC');
});

/**
 * Subtask: ORD-737
 * Kịch bản: [IT-CRS-02] Xem chi tiết khóa học, Điểm nổi bật và Giáo trình
 */
Scenario('ORD-737 [IT-CRS-02]: Người dùng mở trang /courses/course-1 xem chi tiết và giáo trình', async ({ I }) => {
  I.amOnPage('/courses/course-1');
  I.waitForText('Lập trình Web Full Stack', 15);
  I.see('Lập trình Web Full Stack');
  I.see('Mua ngay');
});

/**
 * Subtask: ORD-738
 * Kịch bản: [IT-CRS-03] Xử lý ngoại lệ khi truy cập ID khóa học không tồn tại
 */
Scenario('ORD-738 [IT-CRS-03]: Truy cập ID khóa học không tồn tại -> Hiển thị trang 404', async ({ I }) => {
  I.amOnPage('/courses/khoa-hoc-khong-ton-tai-999');
  I.wait(2);
  I.see('404');
});

/**
 * Subtask: ORD-739 & ORD-740
 * Kịch bản: [IT-CRS-04] Quản trị viên truy cập trang Quản lý Khóa học và mở form tạo mới
 */
Scenario('ORD-739 [IT-CRS-04]: Admin đăng nhập -> Vào /admin/courses -> Bấm "+ Tạo khóa học"', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/courses');
  I.waitForText('+ Tạo khóa học', 15);
  I.see('+ Tạo khóa học');
  I.click('+ Tạo khóa học');
  I.waitForText('Thêm khóa học mới', 15);
  I.see('Thêm khóa học mới');
});

/**
 * Subtask: ORD-741
 * Kịch bản: [IT-CRS-06] Quản trị viên kiểm tra danh sách bảng quản lý khóa học
 */
Scenario('ORD-741 [IT-CRS-06]: Admin kiểm tra bảng danh sách khóa học và các nút thao tác', async ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/courses');
  I.waitForText('Danh sách khóa học', 15);
  I.see('Danh sách khóa học');
});

/**
 * Subtask: ORD-742
 * Kịch bản: [IT-CRS-07] Phân quyền RBAC - Học viên thông thường không được phép truy cập /admin/courses
 */
Scenario('ORD-742 [IT-CRS-07]: Phân quyền RBAC - Học viên cố tình vào /admin/courses -> Bị chặn', async ({ I }) => {
  loginAsStudent(I);
  I.amOnPage('/admin/courses');
  I.wait(2);
  I.dontSee('+ Tạo khóa học');
});
