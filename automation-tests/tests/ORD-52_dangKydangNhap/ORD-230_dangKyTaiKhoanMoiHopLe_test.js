Feature('ORD-52: Đăng ký & Đăng nhập');

Scenario('ORD-230: Đăng ký tài khoản mới hợp lệ', ({ I }) => {

  // 1. Mở trang đăng ký
  I.amOnPage('/register');
  I.see('Đăng ký tài khoản');

  // 2. Nhập thông tin hợp lệ
  I.fillField('input[placeholder="Nguyễn Văn A"]', 'Nguyen Van A');

  I.fillField(
    'input[placeholder="your@email.com"]',
    `test${Date.now()}@gmail.com`
  );

  I.fillField(
    'input[placeholder="Ví dụ: 0912345678"]',
    `09${Math.floor(10000000 + Math.random() * 90000000)}`
  );

  I.fillField(
    'input[placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)"]',
    'User@2005..'
  );

  I.fillField(
    'input[placeholder="Nhập lại mật khẩu"]',
    'User@2005..'
  );

  // 3. Nhấn Đăng ký
  I.scrollPageToBottom();
  I.click('Đăng ký tài khoản');

  // 4. Kiểm tra đăng ký thành công
  I.waitForText('Đăng ký thành công', 10);
});