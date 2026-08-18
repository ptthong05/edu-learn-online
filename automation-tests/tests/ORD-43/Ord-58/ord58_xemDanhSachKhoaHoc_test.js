Feature('ORD-58: Xem danh sách khoá học');

Scenario('Hiển thị bảng danh sách khóa học với đầy đủ các cột', ({ I }) => {
    // 1. Tiền điều kiện & Bước 1: Đăng nhập admin và vào Admin Dashboard -> Courses
    I.amOnPage('/admin/courses');
    I.wait(3);

    // 2. Kết quả mong đợi: Kiểm tra đầy đủ các cột trên bảng
    I.see('Course Name');
    I.see('Category');
    I.see('Price/Sale Price');
    I.see('Students');
    I.see('Status');
    I.see('Actions');
});