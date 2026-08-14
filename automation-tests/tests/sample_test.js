Feature('Đăng nhập');

Scenario('Kiểm tra giao diện đăng nhập', ({ I }) => {
  I.amOnPage('/login');
  I.see('Đăng nhập tài khoản');
  I.fillField('input[type="email"]', 'test@example.com');
  I.fillField('input[type="password"]', '123456');
  I.click('Đăng nhập');
});
