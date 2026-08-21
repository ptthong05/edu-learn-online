Feature('ORD-75 - View User Detail');

Scenario('Admin views user detail', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]', 'manager@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord75-view-user-detail');

});