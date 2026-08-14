Feature('Quản lý khóa học - ORD-43');

Scenario('Kiểm tra hiển thị danh sách khóa học', ({ I }) => {
    I.amOnPage('/courses'); // Đường dẫn đến trang khóa học
    I.see('Quản lý khóa học'); // Nội dung mong đợi thấy trên màn hình
});

Scenario('Thêm khóa học mới', ({ I }) => {
    I.amOnPage('/courses');
    I.click('Thêm khóa học');
    I.fillField('input[name="courseName"]', 'Khóa học Lập trình Java');
    I.click('Lưu');
});