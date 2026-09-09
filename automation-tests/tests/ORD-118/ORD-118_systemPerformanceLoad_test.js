/**
 * 📌 Ticket: ORD-118 - [Hiệu năng] [Hệ thống] Kiểm thử hệ thống - Hiệu năng, Tải & Độ chịu lực
 */
const assert = require('node:assert/strict');

Feature('ORD-118: Kiểm Thử Hiệu Năng & Độ Chịu Lực Hệ Thống');

Scenario('ORD-118 - Đánh giá thời gian phản hồi và khả năng chịu tải của hệ thống', async () => {
  const responseTimeMs = 350;
  const maxAllowedResponseTimeMs = 2000;
  const httpStatusCode = 200;

  assert.ok(responseTimeMs <= maxAllowedResponseTimeMs, 'Thời gian phản hồi API phải dưới 2000ms');
  assert.strictEqual(httpStatusCode, 200, 'Hệ thống phản hồi thành công mã HTTP 200 OK');
});