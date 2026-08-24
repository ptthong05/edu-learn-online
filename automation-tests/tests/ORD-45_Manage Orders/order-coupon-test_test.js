Feature('ORD-83 - Order Coupon');

Scenario('Order applies coupon correctly ORD-83', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]','manager@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord83-order-coupon');

});