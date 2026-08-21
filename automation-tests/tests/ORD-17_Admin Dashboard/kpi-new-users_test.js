Feature('ORD-25 - KPI New Users');

Scenario('New Users KPI is displayed ORD-25', ({ I }) => {

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

    I.saveScreenshot('ord25-new-users');

});