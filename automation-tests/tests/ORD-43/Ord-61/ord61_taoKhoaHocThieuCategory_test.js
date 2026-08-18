Feature('ORD-43: Quản lý khóa học - ORD-61: Tạo khoá học thiếu Category');

Scenario('Không cho phép tạo khóa học khi chưa chọn Category', ({ I }) => {
    // 1. Vào Courses -> Thêm mới
    I.amOnPage('/admin/courses');
    I.click('Thêm mới');
    I.wait(2);

    // 2. Điền đầy đủ các trường thông tin ngoại trừ Category
    I.fillField('Course Name', 'ReactJS Cơ bản');
    I.fillField('Short Description', 'Mô tả khóa học thử nghiệm');
    // Bỏ qua chọn Category (I.selectOption('Category', ...))
    I.fillField('Original Price', '500000');

    // 3. Nhấn Lưu
    I.click('Lưu');
    I.wait(2);

    // 4. Kết quả mong đợi: Hiển thị lỗi validation bắt buộc chọn Category
    I.see('Vui lòng chọn danh mục'); // Hoặc thông báo lỗi chứa chữ 'Category' / 'bắt buộc'
});