Feature('ORD-19 - Admin Role Access');

Scenario('Admin can access admin page', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]','manager@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord19-admin-access');

});