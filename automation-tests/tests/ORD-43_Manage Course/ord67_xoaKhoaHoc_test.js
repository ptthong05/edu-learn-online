Feature('ORD-43: Quản lý khóa học - ORD-67: Xoá khoá học chưa phát sinh đơn hàng');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('Đăng nhập');
  I.wait(3);
});

Scenario('Xóa thành công khóa học chưa có đơn hàng', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.click('+ Tạo khóa học');
  I.wait(2);
  I.fillField('input[placeholder*="tên khóa học"]', 'Khóa học cần xóa ORD67');
  I.fillField('input[placeholder="0"]', '200000');
  I.click('text=Chọn danh mục');
  I.click('text=Lập trình Web');
  I.fillField('.ql-editor', 'Mô tả khóa học để kiểm tra xóa.');
  I.click('button[type="submit"]');
  I.wait(3);
  I.see('Khóa học cần xóa ORD67');

  I.click({ xpath: '//tr[contains(., "Khóa học cần xóa ORD67")]//button[normalize-space()="Xóa"]' });
  I.wait(2);
  I.see('Xóa khóa học thành công');
});