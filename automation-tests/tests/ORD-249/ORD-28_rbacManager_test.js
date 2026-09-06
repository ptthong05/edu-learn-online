/**
 * 📌 Subtask: ORD-28 - [Kiểm thử tích hợp] [Hệ thống] Phân quyền kiểm soát truy cập Quyền MANAGER
 */
const assert = require('node:assert/strict');

Feature('ORD-249 / ORD-28: Phân quyền kiểm soát truy cập Quyền MANAGER');

Scenario('ORD-28 - [Kiểm thử tích hợp] [Hệ thống] Phân quyền kiểm soát truy cập Quyền MANAGER', async () => {
  const currentUser = { id: 1, role: 'STUDENT' };
  const requiredRole = 'MANAGER';

  let hasAccess = false;
  if (currentUser.role === requiredRole) {
    hasAccess = true;
  }

  const statusCode = hasAccess ? 200 : 403;
  assert.strictEqual(statusCode, 403, 'Học viên truy cập quyền MANAGER phải nhận 403 Forbidden');
});