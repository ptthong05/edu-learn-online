Feature('ORD-111 - Filter Coupon Status');

Scenario('Admin filters coupon by status ORD-111', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]', 'manage@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord111-filter-status');

});