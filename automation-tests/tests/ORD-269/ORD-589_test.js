const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-589',
  title: '[UAT] [Xác thực] [UAT-001] Học viên đăng ký tài khoản mới và đăng nhập thành công lần đầu'
});

suite.scenario({
  id: 'TC_UAT_589_01',
  name: 'Đăng ký tài khoản mới và đăng nhập lần đầu qua API',
  inputs: 'User động từ uniqueUser()',
  steps: ['Tạo dữ liệu user mới.', 'POST /api/auth/register.', 'POST /api/auth/login.', 'Kiểm tra JWT và role USER.', 'Dọn dữ liệu test.'],
  expected: 'Đăng ký thành công; đăng nhập lần đầu nhận JWT và role USER.'
}, async ({ requestJson, login, uniqueUser, withDatabase, deferCleanup }) => {
  const user = uniqueUser('uat589');
  deferCleanup(() => withDatabase(db => db.run('DELETE FROM users WHERE email = ?', [user.email])));
  const reg = await requestJson('/api/auth/register', { method: 'POST', body: user });
  assert.ok([200, 201].includes(reg.status), `Register failed ${reg.status}: ${JSON.stringify(reg.body)}`);
  const auth = await login(user.email, user.password);
  assert.equal(auth.status, 200, `First login failed ${auth.status}`);
  assert.ok(auth.body && auth.body.token, 'Login không trả token');
  assert.equal(auth.body.user.role, 'USER');
  return `registered=${user.email}; token=true; role=${auth.body.user.role}`;
});

suite.scenario({
  id: 'TC_UAT_589_02',
  name: 'Giao diện đăng ký và đăng nhập truy cập được',
  inputs: '/register và /login',
  steps: ['Mở trang đăng ký.', 'Kiểm tra không Application error.', 'Mở trang đăng nhập.', 'Kiểm tra tiêu đề đăng nhập.'],
  expected: 'Hai màn hình xác thực tải bình thường.'
}, async ({ I }) => {
  I.amOnPage('/register');
  I.wait(1);
  I.dontSee('Application error');
  I.amOnPage('/login');
  I.waitForText('Đăng nhập tài khoản', 15);
  return 'Auth UI pages reachable.';
});
