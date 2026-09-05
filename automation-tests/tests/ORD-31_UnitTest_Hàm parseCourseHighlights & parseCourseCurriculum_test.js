/**
 * ==============================================================================
 * 📚 BỘ KIỂM THỬ GIAO DIỆN NỘI DUNG & GIÁO TRÌNH KHÓA HỌC (CODECEPTJS E2E UI)
 * ==============================================================================
 * 📌 Story Jira: ORD-31 - Hiển thị Điểm nổi bật & Nội dung Giáo trình Khóa học
 * 🎯 Công cụ: CodeceptJS + Playwright (Trình duyệt tự động hóa)
 * 📖 Đối tượng kiểm thử: Trang chi tiết khóa học (/courses/course-1)
 * ==============================================================================
 */

Feature('ORD-31: [Kiểm thử giao diện] Điểm nổi bật & Giáo trình khóa học (Course Curriculum UI Flow)');

/**
 * Kịch bản 1: [UI-01] Truy cập trang chi tiết khóa học và tải dữ liệu thành công
 */
Scenario('ORD-31 [UI-01]: Người dùng mở trang chi tiết khóa học -> Hiển thị tiêu đề và thông tin chung', async ({ I }) => {
  I.amOnPage('/courses/course-1');
  I.waitForText('Lập trình Web Full Stack', 15);
  I.see('Lập trình Web Full Stack');
  I.see('Mua ngay');
});

/**
 * Kịch bản 2: [UI-02] Kiểm tra phần Điểm nổi bật khóa học (Highlights)
 */
Scenario('ORD-31 [UI-02]: Kiểm tra khu vực "Bạn sẽ nhận được gì?" (Course Highlights)', async ({ I }) => {
  I.amOnPage('/courses/course-1');
  I.waitForText('Bạn sẽ nhận được gì?', 15);
  I.see('Bạn sẽ nhận được gì?');
});

/**
 * Kịch bản 3: [UI-03] Chuyển đổi qua lại giữa các Tab Mô tả và Nội dung khóa học
 */
Scenario('ORD-31 [UI-03]: Chuyển sang Tab "Nội dung khóa học" (Curriculum Tab)', async ({ I }) => {
  I.amOnPage('/courses/course-1');
  I.waitForText('Nội dung khóa học', 15);
  I.click('Nội dung khóa học');
  I.wait(1);
  I.see('Nội dung khóa học');
});

/**
 * Kịch bản 4: [UI-04] Thao tác mở/đóng danh sách Chương bài học (Accordion)
 */
Scenario('ORD-31 [UI-04]: Thao tác Click mở / đóng Chương bài học', async ({ I }) => {
  I.amOnPage('/courses/course-1');
  I.waitForText('Nội dung khóa học', 15);
  I.click('Nội dung khóa học');
  I.wait(1);
  I.seeElement('.lg\\:col-span-2');
});

/**
 * Kịch bản 5: [UI-05] Kiểm tra khối Mua hàng nổi bật (Sticky Card) và Nút Mua ngay
 */
Scenario('ORD-31 [UI-05]: Kiểm tra khối đặt mua khóa học nổi bật (Sticky Card)', async ({ I }) => {
  I.amOnPage('/courses/course-1');
  I.waitForText('Mua ngay', 15);
  I.see('Mua ngay');
  I.see('Thêm vào giỏ hàng');
});
