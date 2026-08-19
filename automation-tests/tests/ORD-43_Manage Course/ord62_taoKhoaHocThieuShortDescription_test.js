Feature('ORD-43: Quản lý khóa học - ORD-62: Tạo khoá học thiếu Short Description');

Before(({ I }) => {
    I.amOnPage('/login');
    I.fillField('input[type="email"]', 'manager@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('Đăng nhập');
    I.wait(3);
});

Scenario('Không cho phép tạo khóa học khi bỏ trống Short Description', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('+ Tạo khóa học');
    I.wait(2);
    I.fillField('input[placeholder*="tên khóa học"]', 'ReactJS Cơ bản');
    I.click('button[type="submit"]');
    I.wait(2);
});