Feature('ORD-53: Tìm kiếm & Mua khóa học');

Scenario('ORD-218: Tìm kiếm khoá học theo từ khoá', ({ I }) => {
  const keyword = 'React';

  // 1. Vào /courses
  I.amOnPage('/courses');
  I.waitForText('Tất cả khóa học', 10);

  // 2. Nhập từ khoá vào ô Search
  I.fillField('input[placeholder="Tìm khóa học..."]', keyword);

  // 3. Kết quả mong đợi: Trả về danh sách khoá học có tên/nội dung khớp từ khoá
  I.waitForText(keyword, 5);
  I.see(keyword);
});
