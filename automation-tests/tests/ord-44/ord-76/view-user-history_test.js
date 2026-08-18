Feature('ORD-76 - View User History');

Scenario('Admin views user history ORD-76', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]','manage@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord76-user-history');

});