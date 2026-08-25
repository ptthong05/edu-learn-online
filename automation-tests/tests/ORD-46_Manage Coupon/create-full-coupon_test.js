Feature('ORD-99 - Create Full Coupon');

Scenario('Admin creates coupon with full required fields ORD-99', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]', 'manager@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord99-create-full-coupon');

});