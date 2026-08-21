Feature('ORD-43: Quản lý khóa học - ORD-60: Tạo khoá học thiếu Course Name');

Before(({ I }) => {
    I.amOnPage('/login');
    I.fillField('input[type="email"]', 'manager@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('button[type="submit"]');
    I.wait(3);
});

Scenario('Không cho phép tạo khóa học khi bỏ trống Course Name', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('+ Tạo khóa học');
    I.wait(2);
    I.fillField('input[placeholder="0"]', '500000');
    I.click('button[type="submit"]');
    I.wait(2);
    I.dontSeeInCurrentUrl('/admin/courses?success=true');
});