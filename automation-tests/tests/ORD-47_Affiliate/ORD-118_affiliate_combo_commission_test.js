Feature('ORD-47 - Affiliate');

Scenario('ORD-118 - Commission applies to Combo order through referral link', async ({ I }) => {

  // 1. Login bằng buyer
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'tuan.nguyen@gmail.com');
  I.fillField('input[type="password"]', 'user123');
  I.click('Đăng nhập →');

  // 2. Truy cập link giới thiệu của Affiliate CTV001
  I.amOnPage('/?ref=CTV001');
  I.wait(1);

  // 3. Mở trang Combo
  I.amOnPage('/combos');
  I.waitForText('Combo Thiết kế & Lập trình Web', 10);

  // 4. Mua đúng Combo cần kiểm thử
  I.click({
    xpath: '//h2[normalize-space()="Combo Thiết kế & Lập trình Web"]/ancestor::div[contains(@class,"bg-white")][1]//button[normalize-space()="Mua ngay"]'
});

  // 5. Kiểm tra mã giới thiệu được giữ lại ở Checkout
  I.waitForText('Mã giới thiệu (nếu có)', 10);
  I.seeInField(
    'input[placeholder="Nhập mã người giới thiệu..."]',
    'CTV001'
  );

  I.click('Áp dụng');
  I.waitForText('Người giới thiệu:', 10);
  I.see('Nguyễn Nam');

  // 6. Sang trang xác nhận thanh toán
  I.click('Thanh toán ngay');
  I.waitForText('Xác nhận thanh toán', 10);

  // 7. Tạo đơn hàng Combo
  I.click('Xác nhận thanh toán');
  I.waitInUrl('/order-confirmation?orderId=', 10);

  const currentUrl = await I.grabCurrentUrl();
  const orderId = new URL(currentUrl).searchParams.get('orderId');

  if (!orderId) {
    throw new Error('Không lấy được mã đơn hàng Combo sau khi thanh toán');
  }

  // 8. Đăng xuất buyer để login Admin
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  I.clearCookie();

  // 9. Login Admin
  I.amOnPage('/login');
  I.waitForElement('input[type="email"]', 10);
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('Đăng nhập →');

  // 10. Admin mở danh sách đơn hàng
  I.amOnPage('/admin/orders');
  I.waitForText(orderId, 10);

  // 11. Duyệt đúng đơn Combo vừa tạo
  I.click({
    xpath: `//tr[contains(., "${orderId}")]//button[normalize-space()="Duyệt"]`
  });

  I.waitForText('Đã xong', 10);

  // 12. Kiểm tra doanh thu Affiliate
  I.amOnPage('/admin/affiliate-revenues');
  I.waitForText('Quản lý Doanh thu Affiliate', 10);
  I.waitForText(orderId, 10);

  const orderRow = {
    xpath: `//tr[contains(., "${orderId}")]`
  };

  // Expected Result theo ORD-118:
  // Affiliate nhận commission tính trên giá trị Combo đã mua
  // combo-1 sale_price = 1.190.000đ
  // commission mặc định = 10%
  // => 119.000đ
  I.see('Mã CTV: CTV001', orderRow);
  I.see('Hoa hồng (10%): +119.000đ', orderRow);
  I.see('Đã duyệt', orderRow);
});