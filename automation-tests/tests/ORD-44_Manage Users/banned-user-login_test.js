Feature('ORD-79 - Banned User Login');

Scenario('Banned user cannot login', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]', 'manager@edulearn.vn');

    I.fillField('input[type="password"]', 'admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord79-banned-user-login');

});