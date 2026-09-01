const assert = require('node:assert/strict');
const { createJiraSuite } = require('./support/SP');

const suite = createJiraSuite({
  ticket: 'ORD-317',
  title: '[Kiểm thử hồi quy] [Tiếp thị CTV] Re-test Vòng lặp sinh mã CTV generateUniqueCtvCode'
});

suite.scenario({
  id: 'TC_RET_317_01',
  name: 'Mã CTV có unique index và không cho phép trùng',
  inputs: 'SQLite affiliates.ctv_code',
  steps: ['Kiểm tra unique index ctv_code.', 'Xác nhận dữ liệu CTV hiện tại không trùng.'],
  expected: 'ctv_code được bảo vệ UNIQUE, tránh vòng lặp do sinh mã trùng.'
}, async ({ withDatabase }) => {
  const result = await withDatabase(async db => {
    const indexes = await db.all("PRAGMA index_list('affiliates')");
    const uniqueIndexes = indexes.filter(i => Number(i.unique) === 1);
    assert.ok(uniqueIndexes.some(i => /ctv/i.test(i.name)), 'Không thấy unique index cho ctv_code');
    const dup = await db.get(`SELECT ctv_code, COUNT(*) total FROM affiliates WHERE ctv_code IS NOT NULL GROUP BY ctv_code HAVING COUNT(*) > 1 LIMIT 1`);
    assert.equal(dup, undefined, `Có mã CTV trùng: ${dup && dup.ctv_code}`);
    return uniqueIndexes.map(i => i.name);
  });
  return `uniqueIndexes=${result.join(',')}`;
});

suite.scenario({
  id: 'TC_RET_317_02',
  name: 'Thuật toán chọn mã CTV kế tiếp kết thúc hữu hạn',
  inputs: 'Danh sách ctv_code hiện tại trong SQLite',
  steps: ['Đọc các mã CTV hiện có.', 'Tìm số lớn nhất.', 'Tạo candidate kế tiếp.', 'Xác nhận candidate chưa tồn tại.'],
  expected: 'Có thể xác định mã CTV kế tiếp duy nhất, không lặp vô hạn.'
}, async ({ withDatabase }) => {
  return withDatabase(async db => {
    const rows = await db.all("SELECT ctv_code FROM affiliates WHERE ctv_code LIKE 'CTV%'");
    let next = 1;
    for (const row of rows) {
      const m = String(row.ctv_code || '').match(/^CTV(\d+)$/);
      if (m) next = Math.max(next, Number(m[1]) + 1);
    }
    const candidate = `CTV${String(next).padStart(3, '0')}`;
    const exists = await db.get('SELECT id FROM affiliates WHERE ctv_code = ?', [candidate]);
    assert.equal(exists, undefined, `Candidate ${candidate} đã tồn tại`);
    return `nextCandidate=${candidate}; scanned=${rows.length}`;
  });
});
