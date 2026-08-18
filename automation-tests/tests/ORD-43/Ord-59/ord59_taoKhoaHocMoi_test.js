Feature('ORD-43: Quản lý khóa học - ORD-59: Tạo khoá học mới với đầy đủ thông tin hợp lệ');

Scenario('Tạo khóa học mới thành công với thông tin hợp lệ', ({ I }) => {
    // 1. Bước 1: Vào Trang quản lý khóa học -> Chọn Thêm mới
    I.amOnPage('/admin/courses');
    I.click('Thêm mới');
    I.wait(2);

    // 2. Bước 2: Nhập đầy đủ thông tin theo dữ liệu kiểm thử
    I.fillField('Course Name', 'ReactJS Cơ bản');
    I.fillField('Short Description', 'Khóa học lập trình ReactJS từ cơ bản đến nâng cao');

    // Chọn Category hợp lệ (chọn theo label hoặc index danh sách xổ xuống)
    I.selectOption('Category', 1);
    I.fillField('Original Price', '500000');

    // 3. Bước 3: Nhấn Lưu
    I.click('Lưu');
    I.wait(3);

    // 4. Kết quả mong đợi: Khóa học tạo thành công và xuất hiện trong danh sách
    I.see('ReactJS Cơ bản');
});