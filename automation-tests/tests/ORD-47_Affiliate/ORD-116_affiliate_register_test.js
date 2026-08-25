Feature('ORD-47 - Affiliate');

Scenario('ORD-116 - User registers to become Affiliate', async ({ I }) => {

  // 1. Login bằng user chưa là Affiliate
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'tuan.nguyen@gmail.com');
  I.fillField('input[type="password"]', 'user123');
  I.click('Đăng nhập');
  I.waitForText('Xin chào', 10);

  // 2. Mở trang Affiliate trong Account
  I.amOnPage('/tai-khoan?tab=affiliate');
  I.waitForText('Chương trình Tiếp thị liên kết', 10);
  I.waitForFunction(() => !document.body.innerText.includes('Đang tải thông tin'), 10);

  // 3. Kiểm tra nếu chưa đăng ký thì submit form
  const bodyText = await I.grabTextFrom('body');
  if (!bodyText.includes('Chờ xét duyệt')) {
    I.waitForText('Đăng ký ngay', 10);
    I.click('Đăng ký ngay');
    I.waitForText('Đăng ký Affiliate', 10);
    I.fillField('input[type="date"]', '2000-01-01');
    I.fillField('input[name="bank_name"]', 'vietcombank');
    I.fillField('input[name="bank_account"]', '123456789');
    I.fillField('input[name="address"]', 'TP. Hồ Chí Minh');
    I.checkOption('#agreeTermsCheckbox');
    I.click('#affiliateForm button[type="submit"]');
  }

  // 4. Expected result của ORD-116
  I.waitForText('Chờ xét duyệt', 10);
  I.see('Chờ xét duyệt');
});