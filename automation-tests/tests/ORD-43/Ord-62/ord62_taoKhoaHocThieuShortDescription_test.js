Feature('ORD-43: Quản lý khóa học - ORD-62: Tạo khoá học thiếu Short Description');

Before(({ I }) => {
    I.amOnPage('/');
    I.click('Đăng nhập');
    I.wait(2);
    I.fillField('input[type="email"]', 'manage@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('Đăng nhập');
    I.wait(3);
});

Scenario('Không cho phép tạo khóa học khi bỏ trống Short Description', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('Thêm mới');
    I.wait(2);
    I.fillField('Course Name', 'ReactJS Cơ bản');
    I.selectOption('Category', 1);
    I.fillField('Original Price', '500000');
    I.click('Lưu');
    I.wait(2);
    I.see('Vui lòng nhập mô tả ngắn');
});