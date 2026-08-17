Feature('Quản lý mã giảm giá');

Scenario('TestCase ORD-46 - Kiểm tra trang quản lý mã giảm giá', ({ I }) => {

  I.amOnPage('/admin/coupons');

  I.wait(3);

  I.saveScreenshot('ord46_debug.png');

});