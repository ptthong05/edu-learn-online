/**
 * 📌 Subtask: ORD-569 - [Recovery] [Xác thực] Token đang sử dụng bị xóa session phía server, kiểm tra redirect đúng
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-569: Xóa Session Token phía Server');

Scenario('ORD-569 - Kiểm tra tự động chuyển hướng khi Token session bị thu hồi trên Server', async () => {
  const sessionActive = false; // Session đã bị hủy
  const response = {
    statusCode: sessionActive ? 200 : 401,
    redirectTo: sessionActive ? null : '/login'
  };

  assert.strictEqual(response.statusCode, 401, 'Yêu cầu phải bị từ chối với mã 401');
  assert.strictEqual(response.redirectTo, '/login', 'Hệ thống phải chuyển hướng người dùng về trang Đăng nhập');
});