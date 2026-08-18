Feature('ORD-51: Quản lý Phương thức thanh toán');

Scenario('ORD-201: Luồng thanh toán đầy đủ: chọn phương thức, chuyển khoản, xác nhận thanh toán', async ({ I }) => {
  const userAccount = {
    email: 'ptthong.09@gmail.com',
    password: 'Thong@1234.'
  };

  // 1. Đăng nhập tài khoản người dùng
  I.amOnPage('/login');
  I.see('Đăng nhập tài khoản');
  I.fillField('input[type="email"]', userAccount.email);
  I.fillField('input[type="password"]', userAccount.password);
  I.click('Đăng nhập →');
  I.waitInUrl('/', 10);

  // 2. Bước 1: Chọn khóa học và vào trang Checkout
  I.executeScript(() => {
    sessionStorage.setItem('buyNowItem', JSON.stringify({
      id: 'course-full-flow-201',
      type: 'course',
      course: {
        id: 'course-full-flow-201',
        title: 'Khóa học Fullstack Web Developer Pro',
        price: 399000,
        sale_price: 399000,
        image: ''
      },
      quantity: 1
    }));
  });
  I.amOnPage('/checkout?buynow=true');
  I.waitForText('Phương thức thanh toán', 10);
  I.waitForText('Thanh toán ngay', 10);
  I.see('Khóa học Fullstack Web Developer Pro');

  // 3. Bước 2: Chọn phương thức thanh toán (Thẻ ATM / Internet Banking)
  I.click('Thẻ ATM / Internet Banking');

  // 4. Bước 3: Thực hiện chuyển khoản / xem mã QR thanh toán
  I.click('Thanh toán ngay');
  I.waitInUrl('/order-confirmation', 10);
  I.waitForText('Thông tin chuyển tiền', 10);
  I.see('Chi tiết đơn hàng');
  I.see('Khóa học Fullstack Web Developer Pro');
  I.see('Vui lòng quét mã QR hoặc chuyển khoản đúng thông tin & nội dung trên.');

  // 5. Bước 4: Hoàn tất / Xác nhận thanh toán đơn hàng
  I.click('Xác nhận thanh toán');
  I.waitForText('Cảm ơn bạn đã đặt hàng!', 10);
  I.see('Mã đơn hàng');
  I.see('Chi tiết đơn hàng');
  I.see('Khóa học Fullstack Web Developer Pro');
  I.see('Xem đơn hàng của tôi');
  I.see('Bắt đầu học ngay');
});
