Feature('ORD-43: Quản lý khóa học - ORD-65: Upload Thumbnail cho khoá học');

Before(({ I }) => {
  I.amOnPage('/login');
  I.fillField('input[type="email"]', 'manager@edulearn.vn');
  I.fillField('input[type="password"]', 'admin123');
  I.click('button[type="submit"]');
  I.wait(3);
});

Scenario('Upload thumbnail hợp lệ khi tạo khóa học', ({ I }) => {
  I.amOnPage('/admin/courses');
  I.click('+ Tạo khóa học');
  I.wait(2);
  I.fillField('input[placeholder*="tên khóa học"]', 'ReactJS Thumbnail');
  I.fillField('input[placeholder="0"]', '500000');
  I.click('text=Chọn danh mục');
  I.click('text=Lập trình Web');
  I.fillField('.ql-editor', 'Mô tả upload ảnh.');
  
  // Attach file ảnh thumbnail hợp lệ
  I.attachFile('input[type="file"]', 'sample.png');
  
  I.click('button[type="submit"]');
  I.wait(3);
  I.see('ReactJS Thumbnail');
});