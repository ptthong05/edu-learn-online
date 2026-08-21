Feature('ORD-81 - View Order List');

Scenario('Admin can view order list ORD-81', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]','manager@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord81-order-list');

});