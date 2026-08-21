Feature('ORD-43: Quản lý khóa học - ORD-58: Xem danh sách khoá học');

Before(({ I }) => {
    I.amOnPage('/login');
    I.fillField('input[type="email"]', 'manager@edulearn.vn');
    I.fillField('input[type="password"]', 'admin123');
    I.click('button[type="submit"]');
    I.wait(3);
});

Scenario('Hiển thị bảng danh sách khóa học với đầy đủ các cột', ({ I }) => {
    I.amOnPage('/admin/courses');
    I.wait(3);
    I.see('KHÓA HỌC');
    I.see('DANH MỤC');
    I.see('GIÁ GỐC');
    I.see('GIÁ BÁN');
    I.see('TRẠNG THÁI');
    I.see('THAO TÁC');
});