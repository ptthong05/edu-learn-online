Feature('ORD-47 - Affiliate');

Scenario('ORD-119 - Track Total Clicks of affiliate', async ({ I }) => {

  // 1. Login Affiliate
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('Đăng nhập →');

  // 2. Mở trang Affiliate
  I.amOnPage('/tai-khoan?tab=affiliate');
  I.waitForText('Chương trình Tiếp thị liên kết (Affiliate)', 10);

  // 3. Mở Báo cáo
  I.waitForText('Báo cáo', 10);
  I.click('Báo cáo');
  I.waitForText('Tổng nhấp chuột', 10);

  // 4. Lấy Total Clicks ban đầu
  const totalClicksLocator = {
    xpath: '//p[normalize-space()="Tổng nhấp chuột"]/following-sibling::p[1]'
  };

  const beforeText = await I.grabTextFrom(totalClicksLocator);
  const beforeClicks = Number(beforeText.replace(/\D/g, ''));

  // 5. Kết thúc phiên Affiliate
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  // 6. Phiên truy cập thứ nhất qua link Affiliate
  I.amOnPage('/?ref=CTV_MANAGER');
  I.wait(2);

  // Xóa dữ liệu trình duyệt để tạo phiên truy cập mới
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  // 7. Phiên truy cập thứ hai
  I.amOnPage('/?ref=CTV_MANAGER');
  I.wait(2);

  // Xóa dữ liệu trình duyệt để tạo phiên truy cập mới
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  // 8. Phiên truy cập thứ ba
  I.amOnPage('/?ref=CTV_MANAGER');
  I.wait(2);

  // 9. Xóa phiên khách trước khi login lại Affiliate
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  I.clearCookie();

  // 10. Login lại Affiliate
  I.amOnPage('/login');
  I.waitForElement('input[type="email"]', 10);
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('Đăng nhập →');

  // 11. Mở lại trang Affiliate
  I.amOnPage('/tai-khoan?tab=affiliate');
  I.waitForText('Chương trình Tiếp thị liên kết (Affiliate)', 10);

  // 12. Mở lại Báo cáo
  I.waitForText('Báo cáo', 10);
  I.click('Báo cáo');
  I.waitForText('Tổng nhấp chuột', 10);

  // 13. Lấy Total Clicks sau 3 lượt truy cập
  const afterText = await I.grabTextFrom(totalClicksLocator);
  const afterClicks = Number(afterText.replace(/\D/g, ''));

  // 14. Expected Result ORD-119:
  // 3 phiên truy cập hợp lệ => Total Clicks tăng đúng 3
  if (afterClicks !== beforeClicks + 3) {
    throw new Error(
      `Total Clicks không tăng đúng. Trước: ${beforeClicks}, Sau: ${afterClicks}, Mong đợi: ${beforeClicks + 3}`
    );
  }
});