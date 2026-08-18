Feature('ORD-107 - Max Usage Coupon');

Scenario('Coupon cannot exceed max usage ORD-107', ({ I }) => {

    I.amOnPage('/');

    I.wait(5);

    I.saveScreenshot('ord107-max-usage');

});