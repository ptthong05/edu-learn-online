Feature('ORD-52: Đăng ký & Đăng nhập');

Scenario('ORD-231: Đăng ký với email đã tồn tại', ({ I }) => {
  const testData = {
    name: 'Nguyen Van A',
    email: 'a@gmail.com',
    phone: '0987654321',
    password: 'User@2005..'
  };

  // 1. Truy cập trang đăng ký 
  I.amOnPage('/register');
  I.see('Đăng ký tài khoản');

  // 2. Nhập thông tin đăng ký với email đã tồn tại
  I.fillField('input[placeholder="Nguyễn Văn A"]', testData.name);
  I.fillField('input[type="email"]', testData.email);
  I.fillField('input[type="tel"]', testData.phone);
  I.fillField('input[placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)"]', testData.password);
  I.fillField('input[placeholder="Nhập lại mật khẩu"]', testData.password);

  // 3. Nhấn nút Đăng ký tài khoản
  I.click('Đăng ký tài khoản');

  // 4. Kiểm tra kết quả mong đợi: Hiển thị thông báo lỗi email đã tồn tại và không cho đăng ký
  I.waitForText('Bạn đã có tài khoản.', 5);
  I.dontSeeInCurrentUrl('/login');
});
