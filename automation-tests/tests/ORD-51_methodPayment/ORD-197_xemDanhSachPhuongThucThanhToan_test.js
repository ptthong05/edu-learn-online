Feature('ORD-51: Quản lý Phương thức thanh toán');

Scenario('ORD-197: Xem danh sách phương thức thanh toán', ({ I }) => {
  const adminAccount = {
    email: 'manager@edulearn.vn',
    password: 'admin123'
  };

  // 1. Đăng nhập với tài khoản Admin
  I.amOnPage('/login');
  I.see('Đăng nhập tài khoản');
  I.fillField('input[type="email"]', adminAccount.email);
  I.fillField('input[type="password"]', adminAccount.password);
  I.click('button[type="submit"]');

  // 2. Chờ chuyển hướng thành công vào Admin Dashboard
  I.waitInUrl('/admin', 10);
  I.waitForText('Phương thức thanh toán', 10);

  // 3. Vào Admin Dashboard -> Payment Methods (Phương thức thanh toán)
  I.click('Phương thức thanh toán');
  I.waitInUrl('/admin/payment-methods', 10);

  // 4. Kiểm tra kết quả mong đợi
  I.see('Quản lý thông tin tài khoản ngân hàng và phương thức nhận thanh toán');
  I.waitForText('Ví MoMo', 5);
  I.see('Thẻ ATM / Internet Banking');
  I.see('QR Code Ngân hàng');
})