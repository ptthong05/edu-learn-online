Feature("Quản lý khóa học - Backlog ORD-43");

Scenario("Kiểm tra hiển thị trang quản lý khóa học", ({ I }) => {
    I.amOnPage("/courses");

    // Kiểm tra từ khóa thực tế xuất hiện trên giao diện
    I.see("KHÓA HỌC");
});

Scenario("Kiểm tra chức năng tìm kiếm khóa học", ({ I }) => {
    I.amOnPage("/courses");

    I.fillField('input[type="text"]', "lập trình web");
    I.click("Tìm kiếm");

    // Kiểm tra kết quả tìm kiếm theo chữ thực tế trên trang
    I.see("Khóa học lập trình web");
});