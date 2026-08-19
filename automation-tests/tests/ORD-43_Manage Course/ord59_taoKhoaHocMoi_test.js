Feature('ORD-43: Quản lý khóa học - ORD-59: Tạo khoá học mới với đầy đủ thông tin hợp lệ');

Before(({ I }) => {
    I.amOnPage('/');
    I.click('Đăng nhập');
    I.wait(2);
    I.fillField('input[type="email"]', 'manage@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('Đăng nhập');
    I.wait(3);
});

Scenario('Tạo khóa học mới thành công với thông tin hợp lệ', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('Thêm mới');
    I.wait(2);
    I.fillField('Course Name', 'ReactJS Cơ bản');
    I.fillField('Short Description', 'Khóa học lập trình ReactJS từ cơ bản đến nâng cao');
    I.selectOption('Category', 1);
    I.fillField('Original Price', '500000');
    I.click('Lưu');
    I.wait(3);
    I.see('ReactJS Cơ bản');
});