Feature('ORD-21 - Wrong Password');

Scenario('Admin login failed with wrong password', ({ I }) => {

    // Mở trang chủ
    I.amOnPage('/');

    // Mở form đăng nhập
    I.click('Đăng nhập');

    I.wait(3);

    // Nhập email đúng
    I.fillField(
        'input[type="email"]',
        'manage@edulearn.vn'
    );

    // Nhập password sai
    I.fillField(
        'input[type="password"]',
        'wrongpassword'
    );

    // Click đăng nhập
    I.click('Đăng nhập');

    I.wait(3);

    // Chụp ảnh kiểm tra kết quả
    I.saveScreenshot('ord21-wrong-password');

});