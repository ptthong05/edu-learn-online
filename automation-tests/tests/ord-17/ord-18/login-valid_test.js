Feature('ORD-18 - Admin Login Valid Account');

Scenario('Admin can login with valid account', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField(
        'input[type="email"]',
        'manage@edulearn.vn'
    );

    I.fillField(
        'input[type="password"]',
        'admin123'
    );

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('after-login');

});