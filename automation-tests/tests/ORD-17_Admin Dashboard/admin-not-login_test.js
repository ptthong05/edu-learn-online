Feature('ORD-20 - Access Admin Without Login');

Scenario('Guest cannot access admin page', ({ I }) => {

    I.clearCookie();

    I.amOnPage('/admin');

    I.wait(3);

    I.saveScreenshot('ord20-no-login');

});