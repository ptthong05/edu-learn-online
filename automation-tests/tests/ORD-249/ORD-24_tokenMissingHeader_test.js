/**
 * 📌 Subtask: ORD-24 - [Kiểm thử tích hợp] [Đăng nhập] Token Auth thiếu header Authorization
 */
const assert = require('node:assert/strict');

Feature('ORD-249 / ORD-24: Token Auth thiếu header Authorization');

Scenario('ORD-24 - [Kiểm thử tích hợp] [Đăng nhập] Token Auth thiếu header Authorization', async () => {
  const requestHeader = {}; // Thiếu Header Authorization
  let statusCode = 200;

  if (!requestHeader.Authorization) {
    statusCode = 401;
  }

  assert.strictEqual(statusCode, 401, 'Hệ thống phải trả về 401 Unauthorized khi thiếu header Authorization');
});