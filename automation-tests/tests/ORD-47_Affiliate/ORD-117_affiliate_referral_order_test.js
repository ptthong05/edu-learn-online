Feature('ORD-47 - Affiliate');

Scenario('ORD-117 - Referral link records successful order and commission', async ({ I }) => {
  const timestamp = Date.now();
  const buyerEmail = `buyer_${timestamp}@gmail.com`;
  const buyerPassword = 'User@2005..';

  // 1. Đăng ký & login bằng người mua mới để đảm bảo chưa mua khóa học
  I.amOnPage('/register');
  I.fillField('input[placeholder="Nguyễn Văn A"]', 'Nguyễn Mua Hàng');
  I.fillField('input[type="email"]', buyerEmail);
  I.fillField('input[type="tel"]', '0988776655');
  I.fillField('input[placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)"]', buyerPassword);
  I.fillField('input[placeholder="Nhập lại mật khẩu"]', buyerPassword);
  I.click('Đăng ký tài khoản');
  I.waitInUrl('/login', 10);

  I.fillField('input[type="email"]', buyerEmail);
  I.fillField('input[type="password"]', buyerPassword);
  I.click('Đăng nhập');
  I.waitForText('Nguyễn Mua Hàng', 10);

  // 2. Truy cập link giới thiệu của Affiliate CTV001
  I.amOnPage('/?ref=CTV001');
  I.wait(1);

  // 3. Mở khóa học chưa mua
  I.amOnPage('/courses/course-2');
  I.waitForText('UI/UX Design: Từ cơ bản đến nâng cao', 10);

  // 4. Mua khóa học
  I.see('Mua ngay');
  I.click('Mua ngay');

  // 5. Kiểm tra mã giới thiệu được giữ lại ở Checkout
  I.waitForText('Mã giới thiệu (nếu có)', 10);
  I.seeInField(
    'input[placeholder="Nhập mã người giới thiệu..."]',
    'CTV001'
  );

  // 6. Kiểm tra mã giới thiệu hợp lệ
  I.click('Áp dụng');
  I.waitForText('Người giới thiệu:', 10);
  I.see('Nguyễn Nam');

  // 7. Sang trang xác nhận thanh toán
  I.click('Thanh toán ngay');
  I.waitForText('Xác nhận thanh toán', 10);

  // 8. Tạo đơn hàng
  I.click('Xác nhận thanh toán');

  // 9. Lấy mã đơn hàng vừa tạo
  I.waitInUrl('/order-confirmation?orderId=', 10);

  const currentUrl = await I.grabCurrentUrl();
  const orderId = new URL(currentUrl).searchParams.get('orderId');

  if (!orderId) {
    throw new Error('Không lấy được mã đơn hàng sau khi thanh toán');
  }

  // 10. Đăng xuất phiên buyer để login Admin
  I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  I.clearCookie();

  // 11. Login Admin
  I.amOnPage('/login');
  I.waitForElement('input[type="email"]', 10);
  I.wait(1);
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('Đăng nhập');
  I.waitInUrl('/admin', 10);

  // 12. Admin mở danh sách đơn hàng
  I.amOnPage('/admin/orders');
  I.waitForText(orderId, 10);

  // 13. Duyệt đúng đơn hàng vừa tạo -> completed
  I.click({
    xpath: `//tr[contains(., "${orderId}")]//button[normalize-space()="Duyệt"]`
  });

  I.waitForText('Đã xong', 10);

  // 14. Mở trang doanh thu Affiliate
  I.amOnPage('/admin/affiliate-revenues');
  I.waitForText('Quản lý Doanh thu Affiliate', 10);
  I.waitForText(orderId, 10);

  // 15. Expected Result ORD-117:
  // Affiliate CTV001 được ghi nhận hoa hồng đúng 10% của 699.000đ
  I.see(
    'Mã CTV: CTV001',
    { xpath: `//tr[contains(., "${orderId}")]` }
  );

  I.see(
    'Hoa hồng (10%): +69.900đ',
    { xpath: `//tr[contains(., "${orderId}")]` }
  );

  I.see(
    'Đã duyệt',
    { xpath: `//tr[contains(., "${orderId}")]` }
  );
});