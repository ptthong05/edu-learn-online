const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-586',
  title: '[Regression] [Hệ thống] [REG-001] Chạy lại toàn bộ test suite sau khi kết thúc mỗi sprint'
});

suite.scenario({
  id: 'TC_REG_586_01',
  name: 'Smoke regression tổng hợp cuối Sprint',
  inputs: 'health, courses, categories, login',
  steps: ['Kiểm tra health.', 'Kiểm tra courses/categories.', 'Kiểm tra login Manager.'],
  expected: 'Các chức năng nền tảng PASS sau Sprint.'
}, async ({ requestJson, login, credentials }) => {
  const health = await requestJson('/api/health');
  const courses = await requestJson('/api/courses');
  const categories = await requestJson('/api/categories');
  const auth = await login(credentials.manager.email, credentials.manager.password);
  assert.equal(health.status, 200);
  assert.equal(courses.status, 200);
  assert.equal(categories.status, 200);
  assert.equal(auth.status, 200);
  return `health=${health.status}; courses=${courses.status}; categories=${categories.status}; auth=${auth.status}`;
});
