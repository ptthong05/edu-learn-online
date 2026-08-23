Feature('ORD-43: Quản lý khóa học - ORD-67: Xoá khoá học chưa phát sinh đơn hàng');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Xóa thành công khóa học chưa có đơn hàng', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.wait(2);
  I.click('Xóa'); // Click nút Xóa ở dòng dữ liệu
  I.wait(1);
  // Click nút "Xóa" hoặc "OK" trong Modal xác nhận
  I.click(locate('button').withText('Xóa').last()); 
  I.wait(2);
  I.see('Xóa khóa học thành công');
});