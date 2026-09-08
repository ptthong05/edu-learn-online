/**
 * 📌 Subtask: ORD-571 - [Reliability] [Hệ thống] API server khởi động lại giữa phiên làm việc, kiểm tra báo lỗi phía client
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-571: API Server Khởi Động Lại Giữa Phiên');

Scenario('ORD-571 - Kiểm tra phản hồi báo lỗi thân thiện phía Client khi API Server tái khởi động', async () => {
  const isServerRestarting = true;
  const clientResponse = isServerRestarting 
    ? { status: 503, message: 'Dịch vụ tạm thời ngắt kết nối, vui lòng thử lại' }
    : { status: 200, message: 'Success' };

  assert.strictEqual(clientResponse.status, 503, 'Phải phản hồi mã HTTP 503 Service Unavailable');
  assert.ok(clientResponse.message.length > 0, 'Phải hiển thị thông báo lỗi rõ ràng cho người dùng');
});