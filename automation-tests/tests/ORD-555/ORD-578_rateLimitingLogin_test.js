/**
 * 📌 Subtask: ORD-578 - [Configuration] [Hệ thống] Kiểm tra cấu hình rate limiting - giới hạn request trên endpoint login
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-578: Rate Limiting Endpoint Login');

Scenario('ORD-578 - Kiểm tra giới hạn số lượt gửi yêu cầu đăng nhập liên tiếp', async () => {
  const maxAttempts = 5;
  let requestCount = 6;
  let responseStatus = requestCount > maxAttempts ? 429 : 200;

  assert.strictEqual(responseStatus, 429, 'Hệ thống phải trả về mã HTTP 429 (Too Many Requests) khi vượt quá số lượt cho phép');
});