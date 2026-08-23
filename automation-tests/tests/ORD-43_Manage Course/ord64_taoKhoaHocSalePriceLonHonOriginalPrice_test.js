Feature('ORD-43: Quản lý khóa học - ORD-64: Tạo khoá học có Sale Price lớn hơn Original Price');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Không cho phép tạo khóa học khi Sale Price lớn hơn Original Price', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.click('+ Tạo khóa học');
  I.wait(2);
  I.fillField('input[placeholder*="tên khóa học"]', 'ReactJS Lỗi Giá');
  I.fillField('input[placeholder="0"]', '300000'); // Original Price
  
  if (locate('input[placeholder="0"]').at(2)) {
    I.fillField(locate('input[placeholder="0"]').at(2), '500000'); // Sale Price > Original
  }

  I.click('text=Chọn danh mục');
  I.click('text=Lập trình Web');
  I.fillField('.ql-editor', 'Mô tả giá sai.');
  I.click('button[type="submit"]');
  I.wait(2);
  I.dontSeeInCurrentUrl('/admin/courses?success=true');
});