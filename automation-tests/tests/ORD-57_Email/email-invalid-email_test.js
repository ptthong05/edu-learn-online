Feature('ORD-57 Email - Invalid Email');

Scenario('System handles invalid email correctly', async ({ I }) => {

    I.amOnPage('/login');

    I.fillField('input[type="email"]', 'abc@test');

    I.click('Đăng nhập');

    I.wait(2);

    I.see('Email');

});