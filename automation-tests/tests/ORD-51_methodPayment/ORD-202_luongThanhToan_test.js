Feature('ORD-51: Quản lý Phương thức thanh toán');

Scenario('ORD-202: Luồng thanh toán đầy đủ: chọn phương thức, chuyển khoản, upload minh chứng', async ({ I }) => {
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

  // 3. Bước 2: Chọn phương thức thanh toán
  I.click('Thẻ ATM / Internet Banking');

  // 4. Bước 3: Thực hiện chuyển khoản / quét QR
  I.click('Thanh toán ngay');
  I.waitInUrl('/order-confirmation', 10);
  I.waitForText('Thông tin chuyển tiền', 10);
  I.see('Chi tiết đơn hàng');
  I.see('Lập trình Web Full Stack');
  I.see('Vui lòng quét mã QR hoặc chuyển khoản đúng thông tin & nội dung trên.');

  // Tạo đơn hàng
  I.click('Xác nhận thanh toán');
  I.waitForText('Cảm ơn bạn đã đặt hàng!', 10);
  I.see('Mã đơn hàng');
  I.see('Chi tiết đơn hàng');
  I.see('Lập trình Web Full Stack');

  // 5. Bước 4: Upload minh chứng thanh toán (receipt)
  I.amOnPage('/tai-khoan?tab=orders');
  I.waitForText('Đơn hàng của tôi', 10);
  I.waitForText('Bằng chứng thanh toán', 10);
  I.attachFile('input[type="file"]', 'sample.png');
  I.waitForText('Xem bằng chứng đã tải lên', 10);

  // 6. Kiểm tra kết quả mong đợi: Đơn hàng ở trạng thái Chờ xử lý (pending), chờ Admin xác nhận
  I.see('Chờ xử lý');
  I.see('Lập trình Web Full Stack');
});
