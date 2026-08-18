Feature('ORD-79 - Banned User Login');

Scenario('Banned user cannot login', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]', 'manage@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord79-banned-user-login');

});