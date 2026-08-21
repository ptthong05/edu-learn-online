Feature('ORD-26 - KPI Active Courses');

Scenario('Active Courses KPI is displayed ORD-26', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField(
        'input[type="email"]',
        'manager@edulearn.vn'
    );

    I.fillField(
        'input[type="password"]',
        'admin123'
    );

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord26-active-courses');

});