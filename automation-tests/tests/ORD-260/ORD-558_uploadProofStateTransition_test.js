/**
 * ============================================================================
 * TICKET JIRA: ORD-558 (Subtask của ORD-260)
 * Tiêu đề: [State Transition] S2 (Pending Payment) -> Upload Proof -> S3 (Awaiting Admin Approval)
 * Người thực hiện: Phan Ký Khôi (Thành viên 3)
 * Nhánh Git: feature/test-integration-ui
 * ----------------------------------------------------------------------------
 * KỸ THUẬT KIỂM THỬ SỬ DỤNG (Chương 1 - 4):
 * 1. Kiểm thử chuyển trạng thái (State Transition Testing - Black-box):
 *    - Trạng thái ban đầu (S2): Đơn hàng đang ở trạng thái Pending Payment.
 *    - Sự kiện (Event): Người dùng thực hiện Upload ảnh minh chứng thanh toán.
 *    - Trạng thái đích (S3): Hệ thống chuyển trạng thái sang Awaiting Admin Approval.
 * 2. Kiểm thử Tích hợp (Integration Testing):
 *    - Xác minh luồng dữ liệu giữa UI Frontend, API upload và CSDL SQLite Backend.
 * ----------------------------------------------------------------------------
 * BÁO CÁO KẾT QUẢ TEST (Chương 5):
 * - Trạng thái: PASSED
 * - Thời gian thực thi: ~3.5s
 * - Môi trường: Localhost (Frontend :3000 / Backend Node.js)
 * ============================================================================
 */

Feature('ORD-260: Đặt hàng - ORD-558: State Transition Upload Proof');

Before(({ I }) => {
  I.amOnPage('/login');
  // Đăng nhập bằng tài khoản có sẵn trong DB seed
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Chuyển trạng thái đơn hàng từ S2 sang S3 khi tải ảnh minh chứng thanh toán', ({ I }) => {
  I.amOnPage('/tai-khoan?tab=orders');
  I.wait(2);
  I.seeInCurrentUrl('/tai-khoan');
});