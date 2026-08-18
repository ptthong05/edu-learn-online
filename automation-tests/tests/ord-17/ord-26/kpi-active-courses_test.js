Feature('ORD-26 - KPI Active Courses');

Scenario('Active Courses KPI is displayed ORD-26', ({ I }) => {

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

    I.saveScreenshot('ord26-active-courses');

});