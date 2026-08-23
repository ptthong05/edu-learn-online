Feature('ORD-43: Quản lý khóa học - ORD-63: Tạo khoá học có Sale Price nhỏ hơn Original Price');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Tạo khóa học có Sale Price nhỏ hơn Original Price hợp lệ', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.click('+ Tạo khóa học');
  I.wait(2);
  I.fillField('input[placeholder*="tên khóa học"]', 'ReactJS Khuyến Mãi');
  I.fillField('input[placeholder="0"]', '500000'); // Original Price
  
  // Nhập Sale Price (nếu có input riêng hoặc cùng selector thứ 2)
  if (locate('input[placeholder="0"]').at(2)) {
    I.fillField(locate('input[placeholder="0"]').at(2), '300000');
  }

  I.click('text=Chọn danh mục');
  I.click('text=Lập trình Web');
  I.fillField('.ql-editor', 'Mô tả khóa học có giá khuyến mãi.');
  I.click('button[type="submit"]');
  I.wait(3);
  I.see('ReactJS Khuyến Mãi');
});