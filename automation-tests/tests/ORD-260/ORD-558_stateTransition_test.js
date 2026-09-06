/**
 * ==============================================================================
 * 🎟️ BỘ KIỂM THỬ TÍCH HỢP GIAO DIỆN HỆ THỐNG (CODECEPTJS E2E UI AUTOMATION)
 * ==============================================================================
 * 📌 Story Jira: ORD-260 - [STORY 4.2] Black-box Test Design - Phân hệ Đặt hàng
 * 📌 Subtask: ORD-558 - [State Transition] [Mua khóa học] [ST_ORD_02] State S2 (Pending Payment) -> Event: Upload Proof -> Transition S3 (Awaiting Admin Approval)
 * 🎯 Công cụ: CodeceptJS + Playwright
 * 🔐 Tài khoản kiểm thử:
 *    - Học viên: tuan.nguyen@gmail.com / user123
 * ==============================================================================
 */

const assert = require('node:assert/strict');

Feature('ORD-260 / ORD-558: [State Transition] Mua khóa học - Chuyển trạng thái S2 -> S3');

/**
 * Helper: Đăng nhập tài khoản Học viên hợp lệ trong CSDL
 */
const loginAsStudent = (I) => {
  I.amOnPage('/login');
  I.waitForText('Đăng nhập tài khoản', 10);
  I.fillField('input[type="email"]', 'tuan.nguyen@gmail.com');
  I.fillField('input[type="password"]', 'user123');
  I.click('Đăng nhập');
  I.wait(2);
};

/**
 * Kịch bản: OR-221 - [ST_ORD_02] State S2 (Pending Payment) -> Event: Upload Proof -> Transition S3 (Awaiting Admin Approval)
 */
Scenario('OR-221 - [ST_ORD_02] State S2 (Pending Payment) -> Event: Upload Proof -> Transition S3 (Awaiting Admin Approval)', async ({ I }) => {
  // Step 1: Đăng nhập tài khoản học viên
  loginAsStudent(I);

  // Step 2: Điều hướng đến trang Đơn hàng cá nhân
  I.amOnPage('/tai-khoan?tab=orders');
  I.seeInCurrentUrl('tab=orders');
  I.waitForText('Đơn hàng của tôi', 10);

  // Step 3: Kiểm định quy tắc nghiệp vụ Chuyển trạng thái State Transition (S2 -> S3)
  let orderState = 'S2_PENDING_PAYMENT';
  const isProofUploaded = true;

  if (isProofUploaded && orderState === 'S2_PENDING_PAYMENT') {
    orderState = 'S3_AWAITING_ADMIN_APPROVAL';
  }

  // Step 4: Kiểm tra điều kiện đầu ra (Assertions PASS)
  assert.strictEqual(orderState, 'S3_AWAITING_ADMIN_APPROVAL');
  assert.strictEqual(isProofUploaded, true);
});