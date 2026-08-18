Feature('ORD-21 - Wrong Password');

Scenario('Admin login failed with wrong password', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]','manage@edulearn.vn');

    I.fillField('input[type="password"]','wrongpassword');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord21-wrong-password');

});