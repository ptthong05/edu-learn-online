Feature('ORD-43: Quản lý khóa học - ORD-66: Chỉnh sửa khoá học đã tồn tại');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Chỉnh sửa tên và giá khóa học thành công', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.click('+ Tạo khóa học');
  I.wait(2);
  I.fillField('input[placeholder*="tên khóa học"]', 'Khóa học cần sửa ORD66');
  I.fillField('input[placeholder="0"]', '300000');
  I.click('text=Chọn danh mục');
  I.click('text=Lập trình Web');
  I.fillField('.ql-editor', 'Mô tả ban đầu của khóa học ORD66.');
  I.click('button[type="submit"]');
  I.wait(3);
  I.see('Khóa học cần sửa ORD66');

  I.click({ xpath: '//tr[contains(., "Khóa học cần sửa ORD66")]//button[normalize-space()="Sửa"]' });
  I.wait(2);
  I.fillField('input[placeholder*="tên khóa học"]', 'ReactJS Đã Cập Nhật');
  I.click('button[type="submit"]');
  I.wait(3);
  I.see('ReactJS Đã Cập Nhật');
});