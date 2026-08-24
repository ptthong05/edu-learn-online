Feature('ORD-52: Đăng ký & Đăng nhập');

Scenario('ORD-239: Quên mật khẩu với email không tồn tại', ({ I }) => {
  const testData = {
    email: 'unregistered_user_999@gmail.com' // Email chưa từng đăng ký trong hệ thống
  };

  // 1. Truy cập trang Quên mật khẩu (/forgot-password)
  I.amOnPage('/forgot-password');
  I.see('Quên mật khẩu?'); 

  // 2. Nhập email chưa đăng ký vào form Forgot Password
  I.fillField('input[type="email"]', testData.email); 

  // 3. Nhấn nút gửi yêu cầu (Submit)
  I.click('Gửi liên kết đặt lại mật khẩu');

  // 4. Kiểm tra kết quả mong đợi: Hệ thống xử lý phù hợp (hiển thị thông báo lỗi) 
  I.waitForText('Chưa có tài khoản với email này, vui lòng đăng ký', 5);
  I.dontSee('Kiểm tra email của bạn!');
});  
