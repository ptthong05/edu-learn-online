Feature('ORD-18 - Admin Login Valid Account');

Scenario('Admin can login with valid account ORD-18', ({ I }) => {

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

    I.saveScreenshot('ord18-login-valid');

});