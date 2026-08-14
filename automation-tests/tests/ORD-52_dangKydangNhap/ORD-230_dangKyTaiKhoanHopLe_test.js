Feature('ORD-52: Đăng ký & Đăng nhập');

Scenario('ORD-230: Đăng ký tài khoản mới hợp lệ', ({ I }) => {
  const timestamp = Date.now();
  const random8Digits = Math.floor(10000000 + Math.random() * 90000000);
  const testData = {
    name: 'Nguyen Van A',
    email: `test_${timestamp}@gmail.com`,
    phone: `09${random8Digits}`,
    password: 'User@2005..'
  };

  // 1. Truy cập trang đăng ký
  I.amOnPage('/register');
  I.see('Đăng ký tài khoản');

  // 2. Nhập thông tin hợp lệ vào form
  I.fillField('input[placeholder="Nguyễn Văn A"]', testData.name);
  I.fillField('input[type="email"]', testData.email);
  I.fillField('input[type="tel"]', testData.phone);
  I.fillField('input[placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)"]', testData.password);
  I.fillField('input[placeholder="Nhập lại mật khẩu"]', testData.password);

  // 3. Nhấn nút Đăng ký tài khoản
  I.click('Đăng ký tài khoản');

  // 4. Kiểm tra kết quả mong đợi: Hiển thị thông báo đăng ký thành công
  I.waitForText('Đăng ký thành công', 5);

  // 5. Kiểm tra chuyển hướng sang trang đăng nhập (/login)
  I.waitInUrl('/login', 5);       //5: tg chờ tối đa để phản hòi 
  I.see('Đăng nhập tài khoản');
});
