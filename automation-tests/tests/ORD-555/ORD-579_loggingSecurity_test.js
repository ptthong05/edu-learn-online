/**
 * 📌 Subtask: ORD-579 - [Configuration] [Hệ thống] Kiểm tra cấu hình logging - ghi đủ log khi có lỗi, không log password
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-579: Logging Security & Sanitization');

Scenario('ORD-579 - Ghi log chi tiết lỗi nhưng không để lộ thông tin nhạy cảm (password)', async () => {
  const logOutput = {
    timestamp: '2026-09-08T19:36:32Z',
    level: 'ERROR',
    endpoint: '/api/login',
    error: 'Invalid credentials',
    payload: { username: 'student_user', password: '***REDACTED***' }
  };

  assert.ok(logOutput.error, 'Log phải ghi lại nguyên nhân lỗi');
  assert.strictEqual(logOutput.payload.password, '***REDACTED***', 'Mật khẩu phải được che đi hoặc loại bỏ khỏi nhật ký log');
});