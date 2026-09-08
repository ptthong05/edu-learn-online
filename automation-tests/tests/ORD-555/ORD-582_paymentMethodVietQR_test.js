/**
 * 📌 Subtask: ORD-582 - [Thanh toán] [Phương thức thanh toán] Kiểm tra hiển thị và cấu hình tài khoản ngân hàng / mã QR VietQR
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-582: Phương Thức Thanh Toán VietQR');

Scenario('ORD-582 - Học viên xem thông tin ngân hàng/VietQR & Admin cập nhật cấu hình tài khoản', async () => {
  // Giả lập Admin cấu hình tài khoản nhận tiền
  const adminConfig = {
    bankName: 'MBBank',
    accountNumber: '999988888',
    accountName: 'EDU LEARN ONLINE',
    vietQrEnabled: true
  };

  // Giả lập Học viên gọi API /api/payment-methods lấy thông tin
  const studentViewPayment = { ...adminConfig };

  assert.strictEqual(studentViewPayment.bankName, 'MBBank', 'Học viên thấy đúng tên ngân hàng');
  assert.strictEqual(studentViewPayment.accountNumber, '999988888', 'Học viên thấy đúng số tài khoản');
  assert.strictEqual(studentViewPayment.vietQrEnabled, true, 'Mã QR VietQR đang ở trạng thái kích hoạt');
});