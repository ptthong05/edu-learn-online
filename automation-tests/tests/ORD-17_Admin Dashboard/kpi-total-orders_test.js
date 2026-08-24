Feature('ORD-24 - KPI Total Orders');

Scenario('Total Orders KPI is displayed ORD-24', ({ I }) => {

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

    I.saveScreenshot('ord24-total-orders');

});