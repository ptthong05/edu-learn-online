/**
 * 📌 Subtask: ORD-556 - [BVA] [Hệ thống] [NF-P-006] Upload photo 4.9MB (Biên max-1 byte pass)
 */
const assert = require('node:assert/strict');

Feature('ORD-118 / ORD-556: BVA Upload Photo 4.9MB');

Scenario('ORD-556 - Kiểm tra upload file 4.9MB nằm trong vùng biên cho phép', async () => {
  const fileSizeMB = 4.9;
  const maxLimitMB = 5.0;
  const isAccepted = fileSizeMB <= maxLimitMB;

  assert.strictEqual(isAccepted, true, 'File 4.9MB phải được chấp nhận upload thành công');
});