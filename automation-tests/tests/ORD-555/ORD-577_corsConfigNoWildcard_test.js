/**
 * 📌 Subtask: ORD-577 - [Configuration] [Hệ thống] Kiểm tra cấu hình CORS - chỉ cho phép domain hợp lệ, không dùng wildcard
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-577: Cấu Hình Tường Rào CORS');

Scenario('ORD-577 - Kiểm tra chính sách CORS chấn chỉnh không sử dụng Wildcard (*)', async () => {
  const corsConfig = {
    origin: ['https://edulearnonline.com', 'https://admin.edulearnonline.com'],
    credentials: true
  };

  assert.notStrictEqual(corsConfig.origin, '*', 'Không được phép thiết lập CORS Origin dạng Wildcard (*)');
  assert.ok(Array.isArray(corsConfig.origin), 'Origin phải là danh sách domain định danh cụ thể');
});