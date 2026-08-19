Feature('ORD-43: Quản lý khóa học - ORD-61: Tạo khoá học thiếu Category');

Before(({ I }) => {
    I.amOnPage('/');
    I.click('Đăng nhập');
    I.wait(2);
    I.fillField('input[type="email"]', 'manage@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('Đăng nhập');
    I.wait(3);
});

Scenario('Không cho phép tạo khóa học khi chưa chọn Category', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('Thêm mới');
    I.wait(2);
    I.fillField('Course Name', 'ReactJS Cơ bản');
    I.fillField('Short Description', 'Mô tả khóa học thử nghiệm');
    I.fillField('Original Price', '500000');
    I.click('Lưu');
    I.wait(2);
    I.see('Vui lòng chọn danh mục');
});