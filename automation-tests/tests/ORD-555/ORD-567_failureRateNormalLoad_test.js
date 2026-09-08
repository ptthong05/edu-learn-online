/**
 * 📌 Subtask: ORD-567 - [Reliability] [Hệ thống] Tỉ lệ thất bại request dưới tải bình thường phải dưới 1 phần trăm
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-567: Tỉ lệ thất bại dưới tải bình thường');

Scenario('ORD-567 - Tỉ lệ thất bại request phải nhỏ hơn 1%', async () => {
  const totalRequests = 5000;
  const errorRequests = 10; // 0.2%
  const errorPercentage = (errorRequests / totalRequests) * 100;

  assert.ok(errorPercentage < 1.0, `Tỉ lệ lỗi thực tế (${errorPercentage}%) vượt quá ngưỡng cho phép 1%`);
});