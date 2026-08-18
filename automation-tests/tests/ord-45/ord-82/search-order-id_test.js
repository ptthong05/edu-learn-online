Feature('ORD-82 - Search Order ID');

Scenario('Admin searches order by ID ORD-82', ({ I }) => {

    I.amOnPage('/');

    I.click('Đăng nhập');

    I.wait(3);

    I.fillField('input[type="email"]','manage@edulearn.vn');

    I.fillField('input[type="password"]','admin123');

    I.click('Đăng nhập');

    I.wait(5);

    I.saveScreenshot('ord82-search-order-id');

});