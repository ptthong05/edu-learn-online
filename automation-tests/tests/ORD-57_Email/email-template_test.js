Feature('ORD-57 Email - Email Template');

Scenario('Email content follows correct template', async ({ I }) => {

    I.amOnPage('/login');

    I.fillField('input[type="email"]', 'admin@gmail.com');
    I.fillField('input[type="password"]', 'admin123');

    I.click('Đăng nhập');

    I.wait(3);

    I.amOnPage('/admin');

    I.see('Email');

});