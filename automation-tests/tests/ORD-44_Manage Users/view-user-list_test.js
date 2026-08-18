Feature('ORD-70 - View User List');

Scenario('Admin can view user list', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]', 'manage@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord70-view-user-list');

});