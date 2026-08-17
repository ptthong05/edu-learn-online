Feature('Quản lý người dùng');

Scenario('TestCase ORD-44 - Kiểm tra trang quản lý người dùng', ({ I }) => {

  I.amOnPage('/admin/users');

  I.wait(3);

  I.seeInCurrentUrl('/');

});