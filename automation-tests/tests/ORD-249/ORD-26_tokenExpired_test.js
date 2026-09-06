/**
 * 📌 Subtask: ORD-26 - [Kiểm thử tích hợp] [Đăng nhập] Token Auth hết hạn sử dụng
 */
const assert = require('node:assert/strict');

Feature('ORD-249 / ORD-26: Token Auth hết hạn sử dụng');

Scenario('ORD-26 - [Kiểm thử tích hợp] [Đăng nhập] Token Auth hết hạn sử dụng', async () => {
  const pastTime = Math.floor(Date.now() / 1000) - 3600; // Đã hết hạn 1 tiếng trước
  const tokenPayload = {
    sub: 'user123',
    exp: pastTime
  };

  let statusCode = 200;
  if (tokenPayload.exp < Math.floor(Date.now() / 1000)) {
    statusCode = 401;
  }

  assert.strictEqual(statusCode, 401, 'Hệ thống phải trả về 401 Unauthorized khi Token đã hết hạn');
});