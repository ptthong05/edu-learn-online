Feature('ORD-82 - Search Order ID');

Scenario('Admin searches order by ID ORD-82', ({ I }) => {

    I.amOnPage('/login');

    I.wait(2);

    I.fillField('input[type="email"]','manager@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('button[type="submit"]');

    I.wait(5);

    I.saveScreenshot('ord82-search-order-id');

});