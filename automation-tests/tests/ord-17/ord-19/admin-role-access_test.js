Feature('ORD-19 - Admin Role Access');

Scenario('Admin can access admin page', ({ I }) => {

    // Mở trang chủ
    I.amOnPage('/');

    // Click nút Đăng nhập
    I.click('Đăng nhập');

    I.wait(3);

    // Nhập tài khoản admin
    I.fillField(
        'input[type="email"]',
        'manage@edulearn.vn'
    );

    I.fillField(
        'input[type="password"]',
        'admin123'
    );

    // Login
    I.click('Đăng nhập');

    I.wait(5);

    // Kiểm tra sau khi login
    I.saveScreenshot('ord19-after-login');

});