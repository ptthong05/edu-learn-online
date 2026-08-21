Feature('ORD-43: Quản lý khóa học - ORD-59: Tạo khoá học mới với đầy đủ thông tin hợp lệ');

Before(({ I }) => {
    I.amOnPage('/login');
    I.fillField('input[type="email"]', 'manager@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('button[type="submit"]');
    I.wait(3);
});

Scenario('Tạo khóa học mới thành công với thông tin hợp lệ', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('+ Tạo khóa học');
    I.wait(2);
    I.fillField('input[placeholder*="tên khóa học"]', 'ReactJS Cơ bản');
    I.fillField('input[placeholder="0"]', '500000');
    I.click('button[type="submit"]');
    I.wait(3);
    I.see('ReactJS Cơ bản');
});