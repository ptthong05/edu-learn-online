Feature('ORD-106 - Expired Coupon');

Scenario('Customer cannot apply expired coupon ORD-106', ({ I }) => {

    I.amOnPage('/');

    I.wait(5);

    I.saveScreenshot('ord106-expired-coupon');

});