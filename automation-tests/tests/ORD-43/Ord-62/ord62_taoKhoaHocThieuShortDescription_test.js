Feature('ORD-43: Quản lý khóa học - ORD-62: Tạo khoá học thiếu Short Description');

Scenario('Không cho phép tạo khóa học khi bỏ trống Short Description', ({ I }) => {
    // 1. Vào Courses -> Thêm mới
    I.amOnPage('/admin/courses');
    I.click('Thêm mới');
    I.wait(2);

    // 2. Điền các trường thông tin hợp lệ ngoại trừ Short Description
    I.fillField('Course Name', 'ReactJS Cơ bản');
    // Bỏ trống Short Description (không dùng I.fillField('Short Description', ...))
    I.selectOption('Category', 1);
    I.fillField('Original Price', '500000');

    // 3. Nhấn Lưu
    I.click('Lưu');
    I.wait(2);

    // 4. Kết quả mong đợi: Hiển thị lỗi validation, không lưu được
    I.see('Vui lòng nhập mô tả ngắn'); // Hoặc thông báo lỗi chứa chữ 'Short Description' / 'bắt buộc'
});