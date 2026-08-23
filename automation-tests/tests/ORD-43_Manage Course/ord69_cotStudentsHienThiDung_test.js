Feature('ORD-43: Quản lý khóa học - ORD-69: Cột Students hiển thị đúng số lượng học viên');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Hiển thị thông tin cột số lượng học viên trong bảng khóa học', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.wait(2);
  I.see('STUDENTS');
});