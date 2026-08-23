Feature('ORD-43: Quản lý khóa học - ORD-68: Xoá khoá học đã có học viên mua');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Cảnh báo/Chặn xóa khóa học đã có học viên mua', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.wait(2);
  I.click('Xóa');
  I.wait(1);
  I.click(locate('button').withText('Xóa').last());
  I.wait(2);
  I.dontSeeInCurrentUrl('/admin/courses?deleted=true');
});