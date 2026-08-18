Feature('ORD-52: Đăng ký & Đăng nhập');

Scenario('ORD-232: Đăng ký thiếu thông tin bắt buộc', ({ I }) => {
  // 1. Truy cập trang đăng ký (/register)
  I.amOnPage('/register');
  I.see('Đăng ký tài khoản');

  // 2. Bỏ trống các trường bắt buộc (Full Name, Email, Password,...) và nhấn nút Đăng ký
  I.click('Đăng ký tài khoản');

  // 3. Kiểm tra kết quả mong đợi: Hiển thị thông báo lỗi validation cho các trường bắt buộc
  I.see('Họ và tên không được để trống.');
  I.see('Email không được để trống.');
  I.see('Số điện thoại không được để trống.');
  I.see('Mật khẩu không được để trống.');

  // 4. Đảm bảo hệ thống không cho phép đăng ký và không chuyển hướng sang trang /login
  I.dontSeeInCurrentUrl('/login');
});

Scenario('ORD-232: Đăng ký khi bỏ trống từng trường bắt buộc (Ví dụ: Bỏ trống Họ và tên)', ({ I }) => {
  // 1. Truy cập trang đăng ký (/register)
  I.amOnPage('/register');
  I.see('Đăng ký tài khoản');

  // 2. Nhập các trường khác nhưng bỏ trống Họ và tên
  I.fillField('input[type="email"]', 'valid_user@gmail.com');
  I.fillField('input[type="tel"]', '0912345678');
  I.fillField('input[placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)"]', 'User@2005..');
  I.fillField('input[placeholder="Nhập lại mật khẩu"]', 'User@2005..');

  // 3. Nhấn nút Đăng ký tài khoản
  I.click('Đăng ký tài khoản');

  // 4. Kiểm tra kết quả mong đợi: Hiển thị lỗi validation cho trường Họ và tên
  I.see('Họ và tên không được để trống.');
  I.dontSeeInCurrentUrl('/login');
});
