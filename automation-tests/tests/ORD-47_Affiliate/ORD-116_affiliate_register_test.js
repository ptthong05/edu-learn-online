Feature('ORD-47 - Affiliate');

Scenario('ORD-116 - User registers to become Affiliate', ({ I }) => {

  // 1. Login bằng user chưa là Affiliate
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'tuan.nguyen@gmail.com');
  I.fillField('input[type="password"]', 'user123');
  I.click('Đăng nhập →');

  // 2. Mở trang Affiliate trong Account
  I.amOnPage('/tai-khoan?tab=affiliate');
  I.waitForText('Chương trình Tiếp thị liên kết', 10);

  // 3. Kiểm tra nút đăng ký
  I.see('Đăng ký ngay');
  I.click('Đăng ký ngay');

  // 4. Kiểm tra form đăng ký Affiliate
  I.waitForText('Đăng ký Affiliate', 10);

  // 5. Điền các trường bắt buộc
  // Họ tên, email và số điện thoại đã được hệ thống điền sẵn
  I.fillField('input[type="date"]', '2000-01-01');
  I.fillField('input[name="bank_name"]', 'vietcombank');
  I.fillField('input[name="bank_account"]', '123456789');
  I.fillField('input[name="address"]', 'TP. Hồ Chí Minh');

  // 6. Đồng ý điều khoản
  I.checkOption('#agreeTermsCheckbox');

  // 7. Submit đúng form Affiliate
  I.click('#affiliateForm button[type="submit"]');

  // 8. Expected result của ORD-116:
  // yêu cầu đăng ký được tiếp nhận và chờ Admin xét duyệt
  I.waitForText('Chờ xét duyệt', 10);
  I.see('Chờ xét duyệt');
});