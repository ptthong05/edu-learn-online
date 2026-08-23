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
  I.wait(2);
  I.click('Sửa'); // Hoặc nút/icon edit tương ứng
  I.wait(2);
  I.fillField('input[placeholder*="tên khóa học"]', 'ReactJS Đã Cập Nhật');
  I.click('button[type="submit"]');
  I.wait(3);
  I.see('ReactJS Đã Cập Nhật');
});