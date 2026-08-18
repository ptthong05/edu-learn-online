Feature('ORD-109 - Coupon Status');

Scenario('Coupon status affects usage ORD-109', ({ I }) => {

    I.amOnPage('/');

    I.wait(5);

    I.saveScreenshot('ord109-status-coupon');

});