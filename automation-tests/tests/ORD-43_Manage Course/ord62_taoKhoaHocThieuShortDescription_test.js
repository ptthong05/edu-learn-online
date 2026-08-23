Feature('ORD-43: Quản lý khóa học - ORD-62: Tạo khoá học thiếu Short Description');

Before(({ I }) => {
    I.amOnPage('/login');
    I.fillField('input[type="email"]', 'manager@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('button[type="submit"]');
    I.wait(3);
});

Scenario('Không cho phép tạo khóa học khi chưa nhập Short Description', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.click('+ Tạo khóa học');
    I.wait(2);

    // Course Name hợp lệ
    I.fillField(
        'input[placeholder*="tên khóa học"]',
        'ReactJS Cơ bản'
    );

    // Price hợp lệ
    I.fillField(
        'input[placeholder="0"]',
        '500000'
    );

    // Chọn Category hợp lệ
    I.click('button[type="button"]');
    I.wait(1);

    I.click('text=Lập trình Web');

    // Cố tình KHÔNG nhập Short Description

    I.click('button[type="submit"]');

    I.waitForText(
        'Vui lòng nhập Short Description / Mô tả ngắn.',
        5
    );

    I.see(
        'Vui lòng nhập Short Description / Mô tả ngắn.'
    );
});