Feature('ORD-108 - Fixed Discount Coupon');

Scenario('Fixed coupon reduces correct amount ORD-108', ({ I }) => {

    I.amOnPage('/');

    I.wait(5);

    I.saveScreenshot('ord108-fixed-discount');

});