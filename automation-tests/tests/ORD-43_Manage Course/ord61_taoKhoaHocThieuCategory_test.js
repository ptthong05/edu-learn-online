Feature('ORD-43: Quản lý khóa học - ORD-61: Tạo khoá học thiếu Category');

Before(({ I }) => {
    I.amOnPage('/login');
    I.fillField('input[type="email"]', 'manager@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('button[type="submit"]');
    I.wait(3);
});

Scenario('Không cho phép tạo khóa học khi chưa chọn Category', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('+ Tạo khóa học');
    I.wait(2);

    I.fillField(
        'input[placeholder*="tên khóa học"]',
        'ReactJS Cơ bản'
    );

    // Price là field bắt buộc, nhập giá hợp lệ
    // để test chỉ tập trung vào Category bị bỏ trống.
    I.fillField(
        'input[placeholder="0"]',
        '500000'
    );

    // Short Description hợp lệ
    I.fillField(
        '.ql-editor',
        'Mô tả hợp lệ để kiểm tra trường Category.'
    );

    // Không chọn Category
    I.click('button[type="submit"]');

    I.waitForText(
        'Vui lòng chọn Category / Danh mục.',
        5
    );

    I.see(
        'Vui lòng chọn Category / Danh mục.'
    );
});