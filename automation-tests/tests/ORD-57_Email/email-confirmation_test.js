Feature('ORD-57 Email - Email Confirmation');

Scenario('User login before receiving email notification', async ({ I }) => {

    I.amOnPage('/login');

    I.fillField(
        'input[type="email"]',
        'manager@edulearn.vn'
    );

    I.fillField(
        'input[type="password"]',
        'admin123'
    );

    I.click('Đăng nhập');

    I.wait(3);

    I.seeInCurrentUrl('/');

});