Feature('ORD-51: Quản lý Phương thức thanh toán');

Scenario('ORD-198: Tắt một phương thức thanh toán', async ({ I }) => {
  const adminAccount = {
    email: 'manager@edulearn.vn',
    password: 'admin123'
  };

  // 1. Đăng nhập với tài khoản Admin và vào trang Quản lý phương thức thanh toán
  I.amOnPage('/login');
  I.see('Đăng nhập tài khoản');
  I.fillField('input[type="email"]', adminAccount.email);
  I.fillField('input[type="password"]', adminAccount.password);
  I.click('Đăng nhập →');

  I.waitInUrl('/admin', 10);
  I.waitForText('Phương thức thanh toán', 10);
  I.click('Phương thức thanh toán');
  I.waitInUrl('/admin/payment-methods', 10);

  I.see('Quản lý thông tin tài khoản ngân hàng và phương thức nhận thanh toán');
  I.waitForText('Ví MoMo', 5);

  // 2. Đổi Status của phương thức thanh toán "Ví MoMo" sang Tắt (Ẩn)
  I.click('//tr[contains(., "Ví MoMo")]//button[contains(., "Sửa")]');
  I.waitForText('Chỉnh sửa phương thức', 5);
  I.selectOption('form select', '0'); // Chọn 'Ẩn' (value = 0)

  // 3. Lưu cập nhật
  I.click('Lưu cập nhật');
  I.waitForText('Cập nhật thành công!', 5);
  I.seeElement('//tr[contains(., "Ví MoMo")]//span[contains(., "Ẩn")]');

  // 4. Kiểm tra trang Checkout: Phương thức bị tắt sẽ không xuất hiện làm lựa chọn
  I.executeScript(() => {
    sessionStorage.setItem('buyNowItem', JSON.stringify({
      id: 'test-course-198',
      type: 'course',
      course: {
        id: 'test-course-198',
        title: 'Khóa học Node.js Nâng Cao',
        price: 299000,
        sale_price: 299000,
        image: ''
      },
      quantity: 1
    }));
  });
  I.amOnPage('/checkout?buynow=true');
  I.waitForText('Phương thức thanh toán', 10);
  I.dontSee('Ví MoMo');
  I.see('Thẻ ATM / Internet Banking');
  I.see('QR Code Ngân hàng');

  // 5. Cleanup: Bật lại trạng thái Hoạt động cho "Ví MoMo" để không ảnh hưởng test khác
  I.amOnPage('/admin/payment-methods');
  I.waitForText('Ví MoMo', 5);
  I.click('//tr[contains(., "Ví MoMo")]//button[contains(., "Sửa")]');
  I.waitForText('Chỉnh sửa phương thức', 5);
  I.selectOption('form select', '1'); // Chọn 'Hoạt động' (value = 1)
  I.click('Lưu cập nhật');
  I.waitForText('Cập nhật thành công!', 5);
  I.seeElement('//tr[contains(., "Ví MoMo")]//span[contains(., "Hoạt động")]');
});
