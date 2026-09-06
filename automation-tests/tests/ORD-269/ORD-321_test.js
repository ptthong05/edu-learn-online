const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-321',
  title: '[Kiểm thử hồi quy] [Đăng ký] Regression Test đăng ký tài khoản sau khi thêm tính năng Affiliate'
});

suite.scenario({
  id: 'TC_REG_321_01',
  name: 'Đăng ký USER mới vẫn hoạt động sau thay đổi Affiliate',
  inputs: 'User động từ uniqueUser()',
  steps: ['Tạo user mới.', 'POST /api/auth/register.', 'Kiểm tra HTTP 201.', 'Đăng nhập lần đầu.', 'Dọn user test.'],
  expected: 'Đăng ký USER không bị regression và đăng nhập được.'
}, async ({ requestJson, login, uniqueUser, withDatabase, deferCleanup }) => {
  const user = uniqueUser('reg321');
  deferCleanup(() => withDatabase(db => db.run('DELETE FROM users WHERE email = ?', [user.email])));
  const reg = await requestJson('/api/auth/register', { method: 'POST', body: user });
  assert.ok([200, 201].includes(reg.status), `Register failed ${reg.status}: ${JSON.stringify(reg.body)}`);
  const auth = await login(user.email, user.password);
  assert.equal(auth.status, 200, `Login failed ${auth.status}`);
  assert.equal(auth.body.user.role, 'USER', 'User mới phải có role USER');
  return `register=${reg.status}; login=${auth.status}; role=${auth.body.user.role}`;
});
