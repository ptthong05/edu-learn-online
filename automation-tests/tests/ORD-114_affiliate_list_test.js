Feature('ORD-47 - Affiliate');

Scenario('ORD-114 - View affiliate list as Admin', ({ I }) => {
  I.amOnPage('/login');

  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('Đăng nhập →');

  I.waitForText('Nguyễn Văn A', 10);

  I.amOnPage('/admin/affiliates');
  I.waitForText('Quản lý đối tác Affiliate', 10);

  // Xác nhận bảng hiện tại đã render
  I.see('MÃ CTV');
  I.see('THÔNG TIN CÁ NHÂN');
  I.see('TRẠNG THÁI');

  // Expected Result theo Jira ORD-114
  I.see('Total Revenue');
  I.see('Commission');
  I.see('Withdrawn');
  I.see('Balance');
});