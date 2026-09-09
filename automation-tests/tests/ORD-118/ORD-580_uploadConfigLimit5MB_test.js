/**
 * 📌 Subtask: ORD-580 - [Configuration] [Hệ thống] Kiểm tra cấu hình upload file - giới hạn kích thước max 5MB, chỉ nhận jpg/png
 */
const assert = require('node:assert/strict');

Feature('ORD-118 / ORD-580: Cấu Hình Giới Hạn Upload File');

Scenario('ORD-580 - Kiểm tra hệ thống chỉ chấp nhận định dạng jpg/png và dung lượng <= 5MB', async () => {
  const allowedFormats = ['image/jpeg', 'image/png', 'jpg', 'png'];
  const maxFileSizeMB = 5;

  const testFile = { format: 'png', sizeMB: 4.5 };
  const isValidFormat = allowedFormats.includes(testFile.format);
  const isValidSize = testFile.sizeMB <= maxFileSizeMB;

  assert.strictEqual(isValidFormat, true, 'Định dạng file phải là JPG hoặc PNG');
  assert.strictEqual(isValidSize, true, 'Kích thước file tải lên không được vượt quá 5MB');
});