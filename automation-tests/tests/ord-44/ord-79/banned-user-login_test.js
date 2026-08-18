Feature('ORD-79 - Banned User Login');

Scenario('Banned user cannot login ORD-79', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]','banned@test.com');

    I.fillField('input[type="password"]','123456');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord79-banned-login');

});