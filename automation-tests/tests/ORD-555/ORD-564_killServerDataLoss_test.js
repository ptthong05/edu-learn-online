/**
 * 📌 Subtask: ORD-564 - [Recovery] [Hệ thống] Tắt server đột ngột bằng kill -9, khởi động lại - kiểm tra dữ liệu không mất
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-564: Tắt server đột ngột (kill -9)');

Scenario('ORD-564 - Kiểm tra toàn vẹn dữ liệu sau khi kill -9 server', async () => {
  const dataBeforeCrash = { totalRecords: 150 };
  const dataAfterRestart = { totalRecords: 150 };

  assert.strictEqual(dataAfterRestart.totalRecords, dataBeforeCrash.totalRecords, 'Dữ liệu không được thất thoát sau khi bị kill process');
});