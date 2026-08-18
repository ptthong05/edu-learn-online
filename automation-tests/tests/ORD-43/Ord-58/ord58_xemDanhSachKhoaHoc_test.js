Feature('ORD-43: Quản lý khóa học - ORD-58: Xem danh sách khoá học');

Before(({ I }) => {
    I.amOnPage('/');
    I.click('Đăng nhập');
    I.wait(2);
    I.fillField('input[type="email"]', 'manage@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('Đăng nhập');
    I.wait(3);
});

Scenario('Hiển thị bảng danh sách khóa học với đầy đủ các cột', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.wait(3);
    I.see('Course Name');
    I.see('Category');
    I.see('Price/Sale Price');
    I.see('Students');
    I.see('Status');
    I.see('Actions');
});