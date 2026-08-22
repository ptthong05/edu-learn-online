Feature('ORD-57 Email - Reset Password');

Scenario('User can access reset password page', async ({ I }) => {

    I.amOnPage('/login');

    I.click('Quên mật khẩu');

    I.wait(2);

    I.see('Địa chỉ email');

});