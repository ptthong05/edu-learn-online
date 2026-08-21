Feature('ORD-47 - Affiliate');

Scenario('ORD-119 - Track Total Clicks of affiliate', async ({ I }) => {

  // 1. Login bằng tài khoản Affiliate
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');

  // 2. Mở trang Affiliate
  I.amOnPage('/tai-khoan?tab=affiliate');
  I.waitForText('Chương trình Tiếp thị liên kết (Affiliate)', 10);

  // 3. Mở tab Báo cáo
  I.waitForText('Báo cáo', 10);
  I.click('Báo cáo');
  I.waitForText('Tổng nhấp chuột', 10);

  // 4. Lấy tổng số click trước khi test
  const beforeText = await I.grabTextFrom({
    xpath: '//p[normalize-space()="Tổng nhấp chuột"]/following-sibling::p[1]'
  });

  const beforeClicks = parseInt(
    String(beforeText).replace(/[^\d]/g, ''),
    10
  ) || 0;

  // 5. Xóa phiên đăng nhập
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  // 6. Truy cập link giới thiệu lần 1
  I.amOnPage('/?ref=CTV_MANAGER');
  I.wait(2);

  // 7. Tạo phiên mới và truy cập link giới thiệu lần 2
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  I.amOnPage('/?ref=CTV_MANAGER');
  I.wait(2);

  // 8. Tạo phiên mới và truy cập link giới thiệu lần 3
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  I.amOnPage('/?ref=CTV_MANAGER');
  I.wait(2);

  // 9. Xóa phiên để đăng nhập lại
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  // 10. Login lại tài khoản Affiliate
  I.amOnPage('/login');
  I.waitForElement('input[type="email"]', 10);
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');

  // 11. Mở lại báo cáo Affiliate
  I.amOnPage('/tai-khoan?tab=affiliate');
  I.waitForText('Chương trình Tiếp thị liên kết (Affiliate)', 10);
  I.waitForText('Báo cáo', 10);
  I.click('Báo cáo');
  I.waitForText('Tổng nhấp chuột', 10);

  // 12. Lấy tổng số click sau khi test
  const afterText = await I.grabTextFrom({
    xpath: '//p[normalize-space()="Tổng nhấp chuột"]/following-sibling::p[1]'
  });

  const afterClicks = parseInt(
    String(afterText).replace(/[^\d]/g, ''),
    10
  ) || 0;

  // 13. Expected Result ORD-119:
  // Tổng số click phải tăng sau khi truy cập link Affiliate
  if (afterClicks <= beforeClicks) {
    throw new Error(
      `Tổng nhấp chuột không tăng. Trước: ${beforeClicks}, Sau: ${afterClicks}`
    );
  }
});