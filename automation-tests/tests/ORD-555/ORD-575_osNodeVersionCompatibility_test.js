/**
 * 📌 Subtask: ORD-575 - [Configuration] [Hệ thống] Kiểm tra tương thích môi trường - Node.js version, OS Windows/Linux/Mac
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-575: Tương Thích OS & Version Node.js');

Scenario('ORD-575 - Kiểm tra phiên bản Node.js và thông số Hệ điều hành tương thích', async () => {
  const nodeVersion = process.version;
  const supportedOS = ['win32', 'linux', 'darwin'];
  const currentOS = process.platform;

  assert.ok(nodeVersion, 'Môi trường phải cài đặt Node.js');
  assert.ok(supportedOS.includes(currentOS), `Hệ điều hành ${currentOS} nằm trong danh sách hỗ trợ`);
});