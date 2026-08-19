Feature('ORD-23 - KPI Total Revenue');

Scenario('Total Revenue KPI is displayed ORD-23', ({ I }) => {

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

    I.saveScreenshot('ord23-total-revenue');

});