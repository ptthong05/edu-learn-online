const assert = require('node:assert/strict');

// Tương thích đa nền tảng (Hỗ trợ cả CodeceptJS runner lẫn Node.js --test runner)
const nodeTest = require('node:test');
const Feature = global.Feature || (() => {});
const Scenario = global.Scenario || ((name, fn) => {
  if (typeof nodeTest === 'function') {
    nodeTest(name, fn);
  } else if (typeof nodeTest.test === 'function') {
    nodeTest.test(name, fn);
  } else {
    fn();
  }
});

/**
 * ==============================================================================
 * KIỂM THỬ ĐƠN VỊ (UNIT TEST SPECIFICATIONS)
 * Story cha: ORD-31 - Kiểm thử đơn vị hàm parseCourseHighlights & parseCourseCurriculum
 * Các kịch bản trực thuộc: ORD-32, ORD-33, ORD-34, ORD-35, ORD-36, ORD-602, ORD-37
 * ==============================================================================
 */

// Các hàm logic backend cần kiểm thử
function parseCourseHighlights(value) {
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string' && item.trim());
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string' && item.trim()) : [];
  } catch {
    return [];
  }
}

function parseCourseCurriculum(value) {
  let chapters = value;
  if (typeof value === 'string') {
    try {
      chapters = JSON.parse(value);
    } catch {
      chapters = [];
    }
  }
  if (!Array.isArray(chapters)) return [];

  return chapters
    .map((chapter, chapterIndex) => ({
      id: String(chapter?.id || `chapter-${chapterIndex + 1}`),
      title: typeof chapter?.title === 'string' ? chapter.title.trim() : '',
      lessons: Array.isArray(chapter?.lessons)
        ? chapter.lessons
          .map((lesson, lessonIndex) => ({
            id: String(lesson?.id || `lesson-${chapterIndex + 1}-${lessonIndex + 1}`),
            title: typeof lesson?.title === 'string' ? lesson.title.trim() : '',
            duration: typeof lesson?.duration === 'string' ? lesson.duration : '',
            type: lesson?.type === 'video' ? 'video' : 'document',
            video_url: typeof lesson?.video_url === 'string' ? lesson.video_url : '',
            content: typeof lesson?.content === 'string' ? lesson.content : '',
            preview: Boolean(lesson?.preview)
          }))
          .filter(lesson => lesson.title || lesson.video_url || lesson.content)
        : []
    }))
    .filter(chapter => chapter.title || chapter.lessons.length > 0);
}


Feature('ORD-31: Kiểm thử đơn vị (Unit Test) - parseCourseHighlights & parseCourseCurriculum');

// ==============================================================================

// 1. HÀM parseCourseHighlights (ORD-32 -> ORD-36 & ORD-602)
// ==============================================================================

Scenario('ORD-32 [UT-001]: parseCourseHighlights - Mảng hợp lệ có chứa chuỗi rỗng và khoảng trắng', () => {
  const input = ['Học React từ cơ bản', '', '   ', 'Xây dựng REST API với Node.js', '\t\n'];
  const result = parseCourseHighlights(input);
  assert.deepStrictEqual(result, [
    'Học React từ cơ bản',
    'Xây dựng REST API với Node.js'
  ], 'Hàm phải lọc bỏ hoàn toàn các chuỗi rỗng và khoảng trắng');
});

Scenario('ORD-33 [UT-002]: parseCourseHighlights - Chuỗi JSON String hợp lệ', () => {
  const input = JSON.stringify([
    'Cam kết việc làm sau tốt nghiệp',
    'Hỗ trợ 1-1 từ giảng viên chuyên gia',
    'Cấp chứng chỉ hoàn thành khóa học'
  ]);
  const result = parseCourseHighlights(input);
  assert.deepStrictEqual(result, [
    'Cam kết việc làm sau tốt nghiệp',
    'Hỗ trợ 1-1 từ giảng viên chuyên gia',
    'Cấp chứng chỉ hoàn thành khóa học'
  ], 'Hàm phải parse chính xác chuỗi JSON string thành mảng highlights');
});

Scenario('ORD-34 [UT-003]: parseCourseHighlights - Chuỗi JSON String không hợp lệ (Lỗi cú pháp)', () => {
  const invalidJsonList = [
    '{ invalid_json_format }',
    '[ "Thiếu dấu đóng ngoặc kép, 123 ]',
    'undefined_string_data'
  ];
  invalidJsonList.forEach(input => {
    const result = parseCourseHighlights(input);
    assert.deepStrictEqual(result, [], `Chuỗi JSON lỗi "${input}" phải trả về mảng rỗng []`);
  });
});

Scenario('ORD-35 [UT-004]: parseCourseHighlights - Đầu vào null (Null-Safety)', () => {
  const result = parseCourseHighlights(null);
  assert.deepStrictEqual(result, [], 'Đầu vào null phải trả về mảng rỗng [] an toàn');
});

Scenario('ORD-36 [UT-005]: parseCourseHighlights - Đầu vào undefined (Undefined-Safety)', () => {
  const result = parseCourseHighlights(undefined);
  assert.deepStrictEqual(result, [], 'Đầu vào undefined phải trả về mảng rỗng [] an toàn');
});

Scenario('ORD-602 [UT-006]: parseCourseHighlights - Đầu vào các kiểu dữ liệu không hợp lệ khác (Số, Boolean, Object)', () => {
  assert.deepStrictEqual(parseCourseHighlights(12345), [], 'Đầu vào number phải trả về []');
  assert.deepStrictEqual(parseCourseHighlights(true), [], 'Đầu vào boolean phải trả về []');
  assert.deepStrictEqual(parseCourseHighlights({ key: 'value' }), [], 'Đầu vào Object phải trả về []');
});

// ==============================================================================
// 2. HÀM parseCourseCurriculum (ORD-37)
// ==============================================================================

Scenario('ORD-37 [UT-008]: parseCourseCurriculum - Giáo trình hợp lệ với đầy đủ chương và bài học', () => {
  const mockCurriculum = [
    {
      id: 'chap-1',
      title: 'Chương 1: Tổng quan và Cài đặt môi trường',
      lessons: [
        {
          id: 'les-1-1',
          title: 'Bài 1: Giới thiệu khóa học',
          duration: '10:30',
          type: 'video',
          video_url: 'https://youtube.com/watch?v=mock1',
          preview: true
        },
        {
          id: 'les-1-2',
          title: 'Bài 2: Tài liệu hướng dẫn cài đặt',
          duration: '05:00',
          type: 'document',
          content: '<p>Hướng dẫn cài đặt Node.js và VS Code</p>',
          preview: false
        }
      ]
    }
  ];

  // 1. Kiểm tra đầu vào là Mảng Array
  const resultFromArray = parseCourseCurriculum(mockCurriculum);
  assert.strictEqual(resultFromArray.length, 1);
  assert.strictEqual(resultFromArray[0].id, 'chap-1');
  assert.strictEqual(resultFromArray[0].title, 'Chương 1: Tổng quan và Cài đặt môi trường');
  assert.strictEqual(resultFromArray[0].lessons.length, 2);
  assert.strictEqual(resultFromArray[0].lessons[0].title, 'Bài 1: Giới thiệu khóa học');
  assert.strictEqual(resultFromArray[0].lessons[0].type, 'video');
  assert.strictEqual(resultFromArray[0].lessons[0].preview, true);
  assert.strictEqual(resultFromArray[0].lessons[1].type, 'document');

  // 2. Kiểm tra đầu vào là Chuỗi JSON String (từ Database SQLite)
  const resultFromJson = parseCourseCurriculum(JSON.stringify(mockCurriculum));
  assert.deepStrictEqual(resultFromJson, resultFromArray, 'Kết quả parse từ chuỗi JSON phải trùng khớp với Array');
});
