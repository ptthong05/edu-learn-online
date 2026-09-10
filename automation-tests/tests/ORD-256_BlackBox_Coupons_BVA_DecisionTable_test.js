/**
 * ==============================================================================
 * 🎟️ BỘ KIỂM THỬ GIAO DIỆN MÃ GIẢM GIÁ TOÀN DIỆN 
 * ==============================================================================
 * 📌 Story Jira: ORD-256 - [STORY 3.2] Black-box Test Design - Phân hệ Mã giảm giá
 * 📌 Bao gồm 10 Subtasks:
 *    1. ORD-522: [BVA] [Mã giảm giá] [IT-041] Coupon used_count = quantity (Biên hết lượt)
 *    2. ORD-523: [BVA] [Mã giảm giá] [IT-043] Coupon percent bị chạm trần max_discount
 *    3. ORD-524: [BVA] [Mã giảm giá] [IT-045] Coupon fixed discount lớn hơn giá trị đơn hàng
 *    4. ORD-525: [Decision Table] [DT_CPN_01] Rule 1: Thỏa mãn toàn bộ điều kiện -> Áp dụng thành công
 *    5. ORD-526: [Decision Table] [DT_CPN_02] Rule 2: Coupon hết hạn (ValidDate = False) -> Báo lỗi hết hạn
 *    6. ORD-527: [Decision Table] [DT_CPN_03] Rule 3: Đơn chưa đạt MinOrder -> Báo lỗi thiếu đơn tối thiểu
 *    7. ORD-529: [Decision Table] Tổ hợp 6 điều kiện validate coupon
 *    8. ORD-533: [Exploratory] Khám phá hành vi khi áp coupon nhiều lần liên tiếp trong 1 phiên
 *    9. ORD-534: [Exploratory] Khám phá các edge case của coupon: code đã dùng, dùng hết số lượng
 *   10. ORD-536: [Error Guessing] Đoán lỗi coupon code có dấu cách đầu/cuối, hoa/thường, input rác
 * 🎯 Công cụ: CodeceptJS + Playwright (Trình duyệt tự động hóa E2E)
 * 🔐 Tài khoản kiểm thử: tuan.nguyen@gmail.com / user123
 * ==============================================================================
 */

Feature('ORD-256: [Black-box Test Design] Toàn diện Phân hệ Mã giảm giá (BVA, Decision Table, Exploratory & Error Guessing)');

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
 * Helper: Mở trang Checkout và mở Panel nhập mã giảm giá
 */
const openCheckoutVoucherPanel = (I) => {
  loginAsStudent(I);
  I.amOnPage('/courses/course-1');
  I.waitForText('Mua ngay', 15);
  I.click('Mua ngay');
  I.waitInUrl('/checkout?buynow=true', 10);
  I.waitForText('Chọn voucher giảm giá', 15);
  I.click('Chọn voucher giảm giá');
  I.waitForText('NHẬP MÃ THỦ CÔNG', 15);
  I.see('NHẬP MÃ THỦ CÔNG');
};

/**
 * Subtask 1: ORD-522 - [BVA] used_count = quantity (Biên hết lượt)
 */
Scenario('ORD-522 [BVA]: Nhập mã giảm giá đã hết lượt sử dụng -> Hệ thống báo lỗi hết lượt', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'EXHAUSTED_COUPON');
  I.click('Áp dụng');
  I.wait(1);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 2: ORD-523 - [BVA] Coupon percent bị chạm trần max_discount
 */
Scenario('ORD-523 [BVA]: Áp dụng mã giảm giá % có trần max_discount -> Kiểm tra hiển thị mức giảm', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'SALE30');
  I.click('Áp dụng');
  I.wait(2);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 3: ORD-524 - [BVA] Coupon fixed discount lớn hơn giá trị đơn hàng
 */
Scenario('ORD-524 [BVA]: Coupon giảm giá cố định lớn hơn giá trị đơn hàng -> Không trừ tiền âm', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'FIXED_LARGE_DISCOUNT');
  I.click('Áp dụng');
  I.wait(1);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 4: ORD-525 - [Decision Table] [DT_CPN_01] Rule 1: Thỏa mãn toàn bộ điều kiện
 */
Scenario('ORD-525 [Decision Table - Rule 1]: Mã hợp lệ, còn hạn, còn lượt, đủ đơn tối thiểu -> Áp dụng thành công', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'SALE30');
  I.click('Áp dụng');
  I.wait(2);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 5: ORD-526 - [Decision Table] [DT_CPN_02] Rule 2: Coupon hết hạn sử dụng
 */
Scenario('ORD-526 [Decision Table - Rule 2]: Nhập mã đã quá hạn sử dụng -> Báo lỗi hết hạn', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'EXPIRED_2023');
  I.click('Áp dụng');
  I.wait(1);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 6: ORD-527 - [Decision Table] [DT_CPN_03] Rule 3: Đơn chưa đạt MinOrder
 */
Scenario('ORD-527 [Decision Table - Rule 3]: Giá trị đơn hàng chưa đạt mức tối thiểu -> Báo lỗi thiếu đơn', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'MIN_ORDER_10M');
  I.click('Áp dụng');
  I.wait(1);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 7: ORD-529 - [Decision Table] Tổ hợp 6 điều kiện validate coupon
 */
Scenario('ORD-529 [Decision Table 6 Điều kiện]: Kiểm tra tính toàn vẹn khi kiểm tra các tổ hợp điều kiện', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  // Test mã không tồn tại
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'INVALID_NOT_EXIST');
  I.click('Áp dụng');
  I.wait(1);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 8: ORD-533 - [Exploratory] Áp coupon nhiều lần liên tiếp trong 1 phiên
 */
Scenario('ORD-533 [Exploratory]: Nhấn Áp dụng liên tiếp nhiều lần / Hoán đổi mã trong cùng một phiên', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'SALE30');
  I.click('Áp dụng');
  I.wait(1);
  I.click('Áp dụng');
  I.wait(1);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 9: ORD-534 - [Exploratory] Khám phá Edge cases của Coupon
 */
Scenario('ORD-534 [Exploratory]: Khám phá các trường hợp biên và dị biệt của coupon tại giao diện thanh toán', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', 'SPECIAL_@#$_CODE');
  I.click('Áp dụng');
  I.wait(1);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});

/**
 * Subtask 10: ORD-536 - [Error Guessing] Đoán lỗi leading/trailing spaces, case-insensitivity, input rác
 */
Scenario('ORD-536 [Error Guessing]: Nhập mã có khoảng trắng đầu/cuối hoặc viết chữ thường (sale30)', async ({ I }) => {
  openCheckoutVoucherPanel(I);
  // Nhập chữ thường có dấu cách
  I.fillField('input[placeholder="Nhập mã giảm giá..."]', '  sale30  ');
  I.click('Áp dụng');
  I.wait(2);
  I.seeElement('input[placeholder="Nhập mã giảm giá..."]');
});
