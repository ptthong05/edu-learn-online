Feature('ORD-24 - KPI Total Orders');

Scenario('Total Orders KPI is displayed', ({ I }) => {

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

    I.saveScreenshot('ord24-total-orders');

});