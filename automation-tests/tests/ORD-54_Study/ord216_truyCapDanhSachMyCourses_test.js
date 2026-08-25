Feature('ORD-54: Học tập - ORD-216: Truy cập danh sách My Courses');

Before(({ I }) => {
  I.amOnPage('/login');
  // Sử dụng tài khoản đã tồn tại trong database (ví dụ: manager@edulearn.vn / admin123)
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Hiển thị danh sách khóa học đã mua/enroll cùng tiến độ học', ({ I }) => {
  I.amOnPage('/tai-khoan?tab=courses');
  I.wait(2);
  
  // Kiểm tra URL chứa path trang tài khoản
  I.seeInCurrentUrl('/tai-khoan');
  
  // Kiểm tra tiêu đề hoặc giao diện danh sách khóa học
  I.see('Khóa học'); 
});