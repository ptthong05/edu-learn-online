Feature('ORD-104 - Percent Coupon Max Discount');

Scenario('Percent coupon applies max discount ORD-104', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]', 'manage@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord104-percent-max');

});