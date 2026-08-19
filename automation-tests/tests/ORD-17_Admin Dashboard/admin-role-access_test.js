Feature('ORD-19 - Admin Role Access');

Scenario('Admin can access admin page', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]','manage@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord19-admin-access');

});