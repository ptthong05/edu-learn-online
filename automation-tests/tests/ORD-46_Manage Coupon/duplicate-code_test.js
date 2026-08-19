Feature('ORD-103 - Duplicate Coupon Code');

Scenario('Admin creates duplicated coupon code ORD-103', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]', 'manage@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord103-duplicate-code');

});