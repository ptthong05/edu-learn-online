Feature('ORD-80 - View Order Detail');

Scenario('Admin can view order detail ORD-80', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]','manage@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord80-order-detail');

});