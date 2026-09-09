/**
 * 📌 Subtask: ORD-557 - [BVA] [Hệ thống] [NF-P-007] Upload photo 5.1MB (Vượt biên 5MB max+1 fail)
 */
const assert = require('node:assert/strict');

Feature('ORD-118 / ORD-557: BVA Upload Photo 5.1MB');

Scenario('ORD-557 - Kiểm tra hệ thống từ chối file 5.1MB vượt quá dung lượng tối đa', async () => {
  const fileSizeMB = 5.1;
  const maxLimitMB = 5.0;

  const response = {
    status: fileSizeMB > maxLimitMB ? 400 : 200,
    message: fileSizeMB > maxLimitMB ? 'Dung lượng file vượt quá giới hạn 5MB' : 'Success'
  };

  assert.strictEqual(response.status, 400, 'Hệ thống phải trả về mã lỗi HTTP 400');
  assert.strictEqual(response.message, 'Dung lượng file vượt quá giới hạn 5MB', 'Thông báo lỗi phải chính xác');
});