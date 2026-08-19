Feature('ORD-51: Quản lý Phương thức thanh toán');

Scenario('ORD-200: Cấu hình Account Details cho Bank Transfer', async ({ I }) => {
  const adminAccount = {
    email: 'manager@edulearn.vn',
    password: 'admin123'
  };

  const updatedBank = {
    bank_name: 'Techcombank',
    account_number: '1903688889999',
    account_holder: 'NGUYEN VAN ADMIN'
  };

  // 1. Đăng nhập Admin và vào trang Quản lý phương thức thanh toán
  I.amOnPage('/login');
  I.see('Đăng nhập tài khoản');
  I.fillField('input[type="email"]', adminAccount.email);
  I.fillField('input[type="password"]', adminAccount.password);
  I.click('button[type="submit"]');

  I.waitInUrl('/admin', 10);
  I.waitForText('Phương thức thanh toán', 10);
  I.click('Phương thức thanh toán');
  I.waitInUrl('/admin/payment-methods', 10);
  I.see('Quản lý thông tin tài khoản ngân hàng và phương thức nhận thanh toán');

  // 2. Mở form chỉnh sửa Thẻ ATM / Internet Banking
  I.waitForText('Thẻ ATM / Internet Banking', 5);
  I.click('//tr[contains(., "Thẻ ATM / Internet Banking")]//button[contains(., "Sửa")]');
  I.waitForText('Chỉnh sửa phương thức', 5);

  // 3. Nhập số tài khoản, tên ngân hàng, chủ tài khoản hợp lệ
  I.fillField('input[placeholder="0377987457"]', updatedBank.account_number);
  I.fillField('input[placeholder="Phạm Tấn Thông"]', updatedBank.account_holder);
  I.fillField('input[placeholder="MB Bank"]', updatedBank.bank_name);

  // 4. Nhấn Lưu cập nhật
  I.click('Lưu cập nhật');
  I.waitForText('Cập nhật thành công!', 5);

  // 5. Kiểm tra thông tin hiển thị tại trang Checkout
  I.amOnPage('/checkout?buynow=true');
  I.executeScript(() => {
    sessionStorage.setItem('buyNowItem', JSON.stringify({
      id: 'course-1',
      type: 'course',
      course: {
        id: 'course-1',
        title: 'Lập trình Web Full Stack',
        price: 1200000,
        sale_price: 790000,
        image: ''
      },
      quantity: 1
    }));
    window.location.reload();
  });
  I.waitForText('Phương thức thanh toán', 10);
  I.waitForText('Thanh toán ngay', 10);
  I.click('Thẻ ATM / Internet Banking');
  I.click('Thanh toán ngay');

  // 6. Kiểm tra thông tin tài khoản ngân hàng hiển thị chính xác tại bước chuyển khoản / xác nhận
  I.waitInUrl('/order-confirmation', 10);
  I.waitForText('Thông tin chuyển tiền', 10);
  I.see(updatedBank.bank_name);
  I.see(updatedBank.account_number);
  I.see(updatedBank.account_holder);

  // 7. Cleanup: Khôi phục lại cấu hình ban đầu
  I.amOnPage('/admin/payment-methods');
  I.waitForText('Thẻ ATM / Internet Banking', 5);
  I.click('//tr[contains(., "Thẻ ATM / Internet Banking")]//button[contains(., "Sửa")]');
  I.waitForText('Chỉnh sửa phương thức', 5);
  I.fillField('input[placeholder="0377987457"]', '0377987457');
  I.fillField('input[placeholder="Phạm Tấn Thông"]', 'Phạm Tấn Thông');
  I.fillField('input[placeholder="MB Bank"]', 'MB Bank');
  I.click('Lưu cập nhật');
  I.waitForText('Cập nhật thành công!', 5);
});
