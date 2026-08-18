Feature('ORD-105 - Apply Coupon Order');

Scenario('Customer applies coupon to order ORD-105', ({ I }) => {

    I.amOnPage('/');

    I.wait(5);

    I.saveScreenshot('ord105-apply-coupon');

});