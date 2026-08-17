Feature('Quản lý đơn hàng');

Scenario('TestCase ORD-45 - Kiểm tra trang quản lý đơn hàng', ({ I }) => {

  I.amOnPage('/admin/orders');

  I.wait(3);

  I.saveScreenshot('ord45_debug.png');

});