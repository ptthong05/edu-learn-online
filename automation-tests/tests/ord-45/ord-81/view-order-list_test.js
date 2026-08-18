Feature('ORD-81 - View Order List');

Scenario('Admin can view order list ORD-81', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]','manage@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord81-order-list');

});