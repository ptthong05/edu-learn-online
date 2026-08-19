Feature('ORD-52: Đăng ký & Đăng nhập');

Scenario('ORD-233: Đăng ký với định dạng email không hợp lệ', ({ I }) => {
  const testData = {
    name: 'Nguyen Van A',
    invalidEmail: 'invalid@format',
    phone: '0912345678',
    password: 'User@2005..'
  };

  // 1. Truy cập trang đăng ký (/register)
  I.amOnPage('/register');
  I.see('Đăng ký tài khoản');

  // 2. Nhập các thông tin với định dạng email không hợp lệ (ví dụ: 'abc.co')
  I.fillField('input[placeholder="Nguyễn Văn A"]', testData.name);
  I.fillField('input[type="email"]', testData.invalidEmail);
  I.fillField('input[type="tel"]', testData.phone);
  I.fillField('input[placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)"]', testData.password);
  I.fillField('input[placeholder="Nhập lại mật khẩu"]', testData.password);

  // 3. Nhấn nút Đăng ký tài khoản
  I.click('Đăng ký tài khoản');

  // 4. Kiểm tra kết quả mong đợi: Hiển thị thông báo lỗi định dạng email không đúng
  I.waitForText('Email không đúng định dạng.', 5);

  // 5. Đảm bảo hệ thống không cho phép đăng ký và không chuyển hướng sang trang /login
  I.dontSeeInCurrentUrl('/login');
});
