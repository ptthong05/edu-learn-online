Feature('ORD-100 - Missing Coupon Code');

Scenario('Admin creates coupon without code ORD-100', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField(
        'input[type="email"]',
        'manager@edulearn.vn'
    );

    I.fillField(
        'input[type="password"]',
        'admin123'
    );

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord100-missing-code');

});