Feature('ORD-21 - Wrong Password');

Scenario('Admin login failed with wrong password', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]','manager@edulearn.vn');

    I.fillField('input[type="password"]','wrongpassword');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord21-wrong-password');

});