Feature('ORD-43: Quản lý khóa học - ORD-60: Tạo khoá học thiếu Course Name');

Scenario('Không cho phép tạo khóa học khi bỏ trống Course Name', ({ I }) => {
    // 1. Vào Courses -> Thêm mới
    I.amOnPage('/admin/courses');
    I.click('Thêm mới');
    I.wait(2);

    // 2. Bỏ trống Course Name, điền các trường còn lại
    // (Không nhập I.fillField('Course Name', ...))
    I.fillField('Short Description', 'Mô tả khóa học thử nghiệm');
    I.selectOption('Category', 1);
    I.fillField('Original Price', '500000');

    // 3. Nhấn Lưu
    I.click('Lưu');
    I.wait(2);

    // 4. Kết quả mong đợi: Hiển thị lỗi validation, không lưu được
    // Thường hệ thống sẽ báo lỗi yêu cầu nhập tên khóa học hoặc không rời khỏi trang tạo mới
    I.see('Vui lòng nhập tên khóa học'); // Hoặc chữ 'required' / 'bắt buộc' tùy theo giao diện thực tế
});