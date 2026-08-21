Feature('ORD-103 - Duplicate Coupon Code');

Scenario('Admin creates duplicated coupon code ORD-103', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]', 'manager@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord103-duplicate-code');

});