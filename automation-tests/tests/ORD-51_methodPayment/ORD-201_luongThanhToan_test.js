Feature('ORD-51: Quản lý Phương thức thanh toán');

Scenario('ORD-201: Luồng thanh toán đầy đủ: chọn phương thức, chuyển khoản, xác nhận thanh toán', async ({ I }) => {
  const userAccount = {
    email: 'tuan.nguyen@gmail.com',
    password: 'user123'
  };

  // 1. Đăng nhập tài khoản người dùng
  I.amOnPage('/login');
  I.see('Đăng nhập tài khoản');
  I.fillField('input[type="email"]', userAccount.email);
  I.fillField('input[type="password"]', userAccount.password);
  I.click('Đăng nhập');
  I.waitForText('Nguyễn Minh Tuấn', 10);

  // 2. Bước 1: Chọn khóa học và vào trang Checkout
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
  I.see('Lập trình Web Full Stack');

  // 3. Bước 2: Chọn phương thức thanh toán (Thẻ ATM / Internet Banking)
  I.click('Thẻ ATM / Internet Banking');

  // 4. Bước 3: Thực hiện chuyển khoản / xem mã QR thanh toán
  I.click('Thanh toán ngay');
  I.waitInUrl('/order-confirmation', 10);
  I.waitForText('Thông tin chuyển tiền', 10);
  I.see('Chi tiết đơn hàng');
  I.see('Lập trình Web Full Stack');
  I.see('Vui lòng quét mã QR hoặc chuyển khoản đúng thông tin & nội dung trên.');

  // 5. Bước 4: Hoàn tất / Xác nhận thanh toán đơn hàng
  I.click('Xác nhận thanh toán');
  I.waitForText('Cảm ơn bạn đã đặt hàng!', 10);
  I.see('Mã đơn hàng');
  I.see('Chi tiết đơn hàng');
  I.see('Lập trình Web Full Stack');
  I.see('Xem đơn hàng của tôi');
  I.see('Bắt đầu học ngay');
});
