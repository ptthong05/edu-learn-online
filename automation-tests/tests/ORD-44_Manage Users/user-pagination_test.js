Feature('ORD-71 - User Pagination');

Scenario('Admin can view user pagination', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]', 'manager@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord71-user-pagination');

});