const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-318',
  title: '[Kiểm thử hồi quy] [Hệ thống] Re-test Cấu hình giới hạn CORS sau khi fix wildcard'
});

suite.scenario({
  id: 'TC_RET_318_01',
  name: 'CORS không còn cho phép wildcard *',
  inputs: 'OPTIONS /api/courses; Origin=http://localhost:3000',
  steps: ['Gửi CORS preflight.', 'Đọc Access-Control-Allow-Origin.', 'Xác nhận không phải wildcard.'],
  expected: 'Origin được giới hạn; Access-Control-Allow-Origin không bằng *.'
}, async ({ requestJson }) => {
  const res = await requestJson('/api/courses', {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET'
    }
  });
  assert.notEqual(res.status, 500);
  const allow = res.headers['access-control-allow-origin'];
  assert.ok(allow, 'Thiếu Access-Control-Allow-Origin');
  assert.notEqual(allow, '*', 'CORS wildcard vẫn còn, fix chưa đạt');
  return `allow-origin=${allow}`;
});
