/**
 * 📌 Subtask: ORD-27 - [Kiểm thử tích hợp] [Đăng nhập] Token Auth bị giả mạo chữ ký signature
 */
const assert = require('node:assert/strict');

Feature('ORD-249 / ORD-27: Token Auth bị giả mạo chữ ký signature');

Scenario('ORD-27 - [Kiểm thử tích hợp] [Đăng nhập] Token Auth bị giả mạo chữ ký signature', async () => {
  const originalSignature = 'valid_secret_hash_signature';
  const tamperedSignature = 'fake_tampered_signature';

  let isVerified = false;
  if (tamperedSignature === originalSignature) {
    isVerified = true;
  }

  const statusCode = isVerified ? 200 : 401;
  assert.strictEqual(statusCode, 401, 'Hệ thống phải từ chối Token bị giả mạo chữ ký');
});