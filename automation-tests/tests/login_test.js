Feature('Authentication & Basic Navigation');

Scenario('Kiểm tra hiển thị trang đăng nhập', ({ I }) => {
  I.amOnPage('/login');
  I.see('Đăng nhập');
});
