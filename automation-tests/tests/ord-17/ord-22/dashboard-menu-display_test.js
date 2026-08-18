Feature('ORD-22 - Dashboard Menu Display');

Scenario('Dashboard menu displays correctly', ({ I }) => {

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

    I.saveScreenshot('ord22-dashboard-menu');

});