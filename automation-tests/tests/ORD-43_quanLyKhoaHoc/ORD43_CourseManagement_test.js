Feature("Quản lý khóa học - Backlog ORD-43");

Scenario("Kiểm tra hiển thị trang quản lý khóa học", ({ I }) => {
    // 1. Truy cập vào trang quản lý khóa học (hoặc /admin/courses tùy đường dẫn dự án)
    I.amOnPage("/courses");

    // 2. Kiểm tra xem có xuất hiện tiêu đề hoặc các nút bấm quan trọng không
    I.see("Danh sách khóa học");
});

Scenario("Kiểm tra chức năng tìm kiếm khóa học", ({ I }) => {
    I.amOnPage("/courses");

    // Điền từ khóa tìm kiếm và bấm nút Tìm kiếm
    I.fillField('input[type="text"]', "Lập trình Web");
    I.click("Tìm kiếm");

    // Kiểm tra kết quả hiển thị
    I.see("Lập trình Web");
});