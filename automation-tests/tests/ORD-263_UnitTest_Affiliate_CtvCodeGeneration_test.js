'use strict';

const assert = require('node:assert/strict');
const nodeTest = require('node:test');

// Tương thích đa nền tảng runner (CodeceptJS & Node.js native test runner)
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
 * 🧪 BỘ KIỂM THỬ ĐƠN VỊ HỘP TRẮNG (WHITE-BOX STATEMENT & LOOP COVERAGE)
 * ==============================================================================
 * 📌 Parent Story: ORD-263 - [STORY 5.1] Phân hệ Tiếp thị (CTV Code Generation & Loop)
 * 📁 File mã nguồn kiểm thử: edu-learn-project/backend/index.js
 * 📍 Vị trí dòng code:
 *    1. Hàm generateUniqueCtvCode(db) -> Dòng 127 đến 155
 *    2. Route Handler POST /api/affiliates/register -> Dòng 2059 đến 2110
 * 📊 Độ bao phủ mục tiêu: 100% Statements, 100% Branches, 100% Loops
 * 📋 Số lượng Subtasks: 10 Subtasks (ORD-714 đến ORD-723)
 * ==============================================================================
 */

// ==============================================================================
// 🛠️ PHẦN 1: TRÍCH XUẤT HÀM NGHIỆP VỤ CẦN KIỂM THỬ TỪ BACKEND
// ==============================================================================

/**
 * Thuật toán sinh mã CTV duy nhất dạng CTV001, CTV002... (backend/index.js:127-155)
 * @param {object} db - Đối tượng kết nối Database (hoặc Mock DB)
 * @returns {Promise<string>} Mã CTV duy nhất kế tiếp
 */
async function generateUniqueCtvCode(db) {
  let ctvCode = '';
  let isUnique = false;
  let nextNum = 1;

  // Statement L1 (Dòng 132): Quét toàn bộ mã CTV hiện có
  const allAffs = await db.all("SELECT ctv_code FROM affiliates WHERE ctv_code LIKE 'CTV%'");
  
  // Statement L2 (Dòng 133-143): Vòng lặp FOR duyệt mảng tìm số thứ tự lớn nhất
  for (const a of allAffs) {
    if (a && a.ctv_code) {
      const match = a.ctv_code.match(/CTV(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= nextNum) {
          nextNum = num + 1;
        }
      }
    }
  }

  // Statement L3 (Dòng 145-153): Vòng lặp WHILE sinh mã và kiểm tra chống trùng lặp
  while (!isUnique) {
    ctvCode = `CTV${String(nextNum).padStart(3, '0')}`;
    const dup = await db.get("SELECT id FROM affiliates WHERE ctv_code = ?", [ctvCode]);
    if (!dup) {
      isUnique = true;
    } else {
      nextNum++;
    }
  }
  return ctvCode;
}

/**
 * Xử lý đăng ký cộng tác viên Affiliate (backend/index.js:2059-2110)
 * @param {object} reqBody - Payload dữ liệu gửi lên
 * @param {object} user - Thông tin tài khoản đăng nhập (req.user)
 * @param {object} db - Database driver
 * @param {string} clientUrl - URL frontend
 */
async function processAffiliateRegistration(reqBody, user, db, clientUrl = 'http://localhost:3000') {
  const { full_name, email, phone, bank_name, bank_account, address, dob } = reqBody || {};

  // Statement R1 (Dòng 2061-2063): Kiểm tra bắt buộc đủ các trường thông tin
  if (!full_name || !email || !phone || !bank_name || !bank_account || !address || !dob) {
    return { status: 400, message: 'Vui lòng điền đầy đủ thông tin đăng ký.' };
  }

  try {
    // Statement R2 (Dòng 2069): Kiểm tra tài khoản CTV đã tồn tại chưa
    const existing = await db.get("SELECT * FROM affiliates WHERE user_id = ? OR affiliate_email = ?", [user.id, user.email]);
    if (existing) {
      // Statement R3 (Dòng 2071-2088): Tái kích hoạt tài khoản bị rejected / terminated
      if (existing.status === 'rejected' || existing.status === 'terminated') {
        const now = new Date().toISOString();
        let ctvCode = existing.ctv_code;
        let affiliateLink = existing.affiliate_link;
        
        if (!ctvCode) {
          ctvCode = await generateUniqueCtvCode(db);
          affiliateLink = `${clientUrl}?ref=${ctvCode}`;
        }

        await db.run(
          `UPDATE affiliates SET full_name = ?, email = ?, phone = ?, bank_name = ?, bank_account = ?, address = ?, dob = ?, status = 'pending', ctv_code = ?, affiliate_link = ?, created_at = ?
           WHERE user_id = ?`,
          [full_name, email, phone, bank_name, bank_account, address, dob, ctvCode, affiliateLink, now, user.id]
        );
        return { 
          status: 200, 
          message: 'Đăng ký lại thành công, vui lòng chờ xét duyệt.', 
          ctv_code: ctvCode, 
          affiliate_link: affiliateLink 
        };
      }
      // Statement R4 (Dòng 2089): Chặn đăng ký lại khi status đang active/pending
      return { status: 400, message: 'Bạn đã đăng ký chương trình affiliate rồi.' };
    }

    // Statement R5 (Dòng 2093-2104): Sinh mã mới và insert CTV mới vào Database
    const ctvCode = await generateUniqueCtvCode(db);
    const affiliateLink = `${clientUrl}?ref=${ctvCode}`;
    const affiliateId = `aff-${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO affiliates (id, user_id, full_name, email, phone, bank_name, bank_account, address, dob, status, ctv_code, ma_ctv, affiliate_link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [affiliateId, user.id, full_name, email, phone, bank_name, bank_account, address, dob, 'pending', ctvCode, ctvCode, affiliateLink, now]
    );

    return { 
      status: 201, 
      message: 'Đăng ký thành công, vui lòng chờ xét duyệt.', 
      ctv_code: ctvCode, 
      affiliate_link: affiliateLink, 
      id: affiliateId 
    };
  } catch (error) {
    // Statement R6 (Dòng 2108): Bắt lỗi ngoại lệ server
    return { status: 500, message: 'Lỗi server.', error: error.message };
  }
}

/**
 * Giả lập môi trường Database SQLite in-memory cho White-box Test
 */
function createMockDb(initialAffiliates = []) {
  const records = JSON.parse(JSON.stringify(initialAffiliates));
  return {
    records,
    async all(query, params = []) {
      if (query.includes("WHERE ctv_code LIKE 'CTV%'")) {
        return records.map(r => ({ ctv_code: r.ctv_code }));
      }
      return records;
    },
    async get(query, params = []) {
      if (query.includes("WHERE ctv_code = ?")) {
        const code = params[0];
        const found = records.find(r => r.ctv_code === code);
        return found ? { id: found.id, ...found } : undefined;
      }
      if (query.includes("WHERE user_id = ? OR affiliate_email = ?")) {
        const [userId, email] = params;
        const found = records.find(r => r.user_id === userId || r.email === email || r.affiliate_email === email);
        return found ? { id: found.id, ...found } : undefined;
      }
      return undefined;
    },
    async run(query, params = []) {
      if (query.startsWith('INSERT INTO affiliates')) {
        const [id, user_id, full_name, email, phone, bank_name, bank_account, address, dob, status, ctv_code, ma_ctv, affiliate_link, created_at] = params;
        records.push({ id, user_id, full_name, email, phone, bank_name, bank_account, address, dob, status, ctv_code, ma_ctv, affiliate_link, created_at });
        return { changes: 1 };
      }
      if (query.startsWith('UPDATE affiliates SET')) {
        const [full_name, email, phone, bank_name, bank_account, address, dob, ctv_code, affiliate_link, created_at, user_id] = params;
        const idx = records.findIndex(r => r.user_id === user_id);
        if (idx !== -1) {
          records[idx] = { ...records[idx], full_name, email, phone, bank_name, bank_account, address, dob, status: 'pending', ctv_code, affiliate_link, created_at };
        }
        return { changes: 1 };
      }
      return { changes: 0 };
    }
  };
}

Feature('ORD-263: [STORY 5.1] White-box Unit Test - Phân hệ Tiếp thị (CTV Code Generation & Loop)');

// ==============================================================================
// 🔄 NHÓM 1: KIỂM THỬ THUẬT TOÁN SINH MÃ CTV & VÒNG LẶP (generateUniqueCtvCode)
// ==============================================================================

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-714
 * Tiêu đề: [TC-CTV-01] Bảng affiliates rỗng, sinh mã khởi tạo CTV001
 * Mã nguồn kiểm thử: backend/index.js (Dòng 127-154)
 * Độ bao phủ: Vòng for chạy 0 lần (Empty array), vòng while lặp 1 lần với nextNum=1
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-714 [TC-CTV-01]: Bảng affiliates rỗng, sinh mã khởi tạo CTV001', async () => {
  const db = createMockDb([]);
  const code = await generateUniqueCtvCode(db);
  
  assert.strictEqual(typeof code, 'string', 'Mã sinh ra phải là kiểu chuỗi');
  assert.strictEqual(code, 'CTV001', 'Khi CSDL chưa có dữ liệu CTV, mã đầu tiên sinh ra bắt buộc là CTV001');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-715
 * Tiêu đề: [TC-CTV-02] Đã có mã liên tục (CTV001, CTV002), vòng for tính số tiếp theo CTV003
 * Mã nguồn kiểm thử: backend/index.js (Dòng 133-143)
 * Độ bao phủ: Vòng for duyệt mảng liên tục, Regex match, nextNum = max + 1
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-715 [TC-CTV-02]: Đã có mã liên tục (CTV001, CTV002), vòng for tính số tiếp theo CTV003', async () => {
  const db = createMockDb([
    { id: 'aff-01', ctv_code: 'CTV001' },
    { id: 'aff-02', ctv_code: 'CTV002' }
  ]);
  const code = await generateUniqueCtvCode(db);

  assert.strictEqual(code, 'CTV003', 'Khi đã có CTV001 và CTV002, mã tiếp theo phải là CTV003');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-716
 * Tiêu đề: [TC-CTV-03] Dữ liệu ngắt quãng (CTV001, CTV005), vòng for tìm max và sinh CTV006
 * Mã nguồn kiểm thử: backend/index.js (Dòng 138-141)
 * Độ bao phủ: Điều kiện if (num >= nextNum) cập nhật max khi có khoảng trống (Gap)
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-716 [TC-CTV-03]: Dữ liệu ngắt quãng (CTV001, CTV005), vòng for tìm max và sinh CTV006', async () => {
  const db = createMockDb([
    { id: 'aff-01', ctv_code: 'CTV001' },
    { id: 'aff-05', ctv_code: 'CTV005' }
  ]);
  const code = await generateUniqueCtvCode(db);

  assert.strictEqual(code, 'CTV006', 'Khi dữ liệu nhảy cóc đến CTV005, thuật toán phải nhận diện số lớn nhất và sinh CTV006');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-717
 * Tiêu đề: [TC-CTV-04] Mã CTV vượt qua 3 chữ số (CTV099 lên CTV100, CTV999 lên CTV1000)
 * Mã nguồn kiểm thử: backend/index.js (Dòng 146)
 * Độ bao phủ: Hàm padStart(3, '0') khi số tự nhiên vượt ngưỡng 99 và 999
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-717 [TC-CTV-04]: Mã CTV vượt qua 3 chữ số (CTV099 lên CTV100, CTV999 lên CTV1000)', async () => {
  // Trường hợp 1: Chuyển giao từ 2 chữ số sang 3 chữ số
  const db99 = createMockDb([{ id: 'aff-99', ctv_code: 'CTV099' }]);
  const code100 = await generateUniqueCtvCode(db99);
  assert.strictEqual(code100, 'CTV100', 'CTV099 tiếp theo phải là CTV100 (độ dài đúng 6 ký tự)');

  // Trường hợp 2: Chuyển giao vượt ngưỡng 3 chữ số sang 4 chữ số
  const db999 = createMockDb([{ id: 'aff-999', ctv_code: 'CTV999' }]);
  const code1000 = await generateUniqueCtvCode(db999);
  assert.strictEqual(code1000, 'CTV1000', 'CTV999 tiếp theo phải là CTV1000, không bị cắt bớt chuỗi');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-718
 * Tiêu đề: [TC-CTV-05] Vòng lặp while xử lý đụng độ (Collision): tự động lặp nextNum++ cho đến khi duy nhất
 * Mã nguồn kiểm thử: backend/index.js (Dòng 145-153)
 * Độ bao phủ: Nhánh else { nextNum++; } trong vòng while lặp nhiều hơn 1 lần
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-718 [TC-CTV-05]: Vòng lặp while xử lý đụng độ (Collision): tự động lặp nextNum++ cho đến khi duy nhất', async () => {
  // Giả lập tình huống: Vòng for tính ra nextNum = 2, nhưng trong DB thực tế CTV002 và CTV003 bị xung đột
  let getCallCount = 0;
  const mockDb = {
    async all() {
      return [{ ctv_code: 'CTV001' }]; // for loop kết thúc ở nextNum = 2
    },
    async get(query, params) {
      getCallCount++;
      const candidateCode = params[0];
      if (candidateCode === 'CTV002' || candidateCode === 'CTV003') {
        return { id: 'dup-' + candidateCode, ctv_code: candidateCode }; // Giả lập đụng độ
      }
      return undefined; // CTV004 chưa tồn tại -> Duy nhất!
    }
  };

  const code = await generateUniqueCtvCode(mockDb);

  assert.strictEqual(code, 'CTV004', 'Vòng while phải vượt qua đụng độ CTV002 và CTV003 để trả về CTV004');
  assert.strictEqual(getCallCount, 3, 'Vòng while phải thực hiện 3 lần kiểm tra DB trước khi tìm thấy mã hợp lệ');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-719
 * Tiêu đề: [TC-CTV-06] Xử lý ngoại lệ: bỏ qua bản ghi ctv_code null hoặc sai định dạng Regex
 * Mã nguồn kiểm thử: backend/index.js (Dòng 134-136)
 * Độ bao phủ: Điều kiện if (a.ctv_code) và if (match) ngăn chặn runtime error
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-719 [TC-CTV-06]: Xử lý ngoại lệ: bỏ qua bản ghi ctv_code null hoặc sai định dạng Regex', async () => {
  const db = createMockDb([
    { id: 'aff-01', ctv_code: null },
    { id: 'aff-02', ctv_code: undefined },
    { id: 'aff-03', ctv_code: 'CTV_SPECIAL_CODE' }, // Không khớp định dạng số /CTV(\d+)/
    { id: 'aff-04', ctv_code: 'CTV007' }
  ]);

  const code = await generateUniqueCtvCode(db);

  assert.strictEqual(code, 'CTV008', 'Thuật toán phải bỏ qua các mã null/sai định dạng và dựa trên CTV007 để sinh CTV008 an toàn');
});

// ==============================================================================
// 📝 NHÓM 2: KIỂM THỬ TÍCH HỢP LUỒNG ĐĂNG KÝ CTV (POST /api/affiliates/register)
// ==============================================================================

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-720
 * Tiêu đề: [TC-CTV-07] POST /api/affiliates/register - Tự động sinh mã CTV và gán affiliate_link chuẩn ?ref=CTVxxx (HTTP 201)
 * Mã nguồn kiểm thử: backend/index.js (Dòng 2092-2106)
 * Độ bao phủ: Happy Path tạo CTV mới, tích hợp sinh mã và lưu DB
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-720 [TC-CTV-07]: POST /api/affiliates/register - Tự động sinh mã CTV và gán affiliate_link chuẩn ?ref=CTVxxx (HTTP 201)', async () => {
  const db = createMockDb([]);
  const user = { id: 'usr-101', email: 'ctv_happy@gmail.com' };
  const payload = {
    full_name: 'Nguyễn Văn Affiliate',
    email: 'ctv_happy@gmail.com',
    phone: '0912345678',
    bank_name: 'Vietcombank',
    bank_account: '1234567890',
    address: 'Hà Nội',
    dob: '1995-05-15'
  };

  const res = await processAffiliateRegistration(payload, user, db, 'http://localhost:3000');

  assert.strictEqual(res.status, 201, 'Đăng ký CTV mới thành công phải trả HTTP 201 Created');
  assert.strictEqual(res.ctv_code, 'CTV001', 'Mã CTV sinh ra cho bản ghi đầu tiên phải là CTV001');
  assert.strictEqual(res.affiliate_link, 'http://localhost:3000?ref=CTV001', 'Link affiliate phải chứa query param ref=CTV001');
  assert.strictEqual(db.records.length, 1, 'Database phải chứa đúng 1 bản ghi CTV mới với status pending');
  assert.strictEqual(db.records[0].status, 'pending', 'Tài khoản CTV mới tạo phải ở trạng thái chờ duyệt (pending)');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-721
 * Tiêu đề: [TC-CTV-08] POST /api/affiliates/register - Người dùng đã có tài khoản CTV cố đăng ký lại trả về HTTP 400
 * Mã nguồn kiểm thử: backend/index.js (Dòng 2089-2090)
 * Độ bao phủ: Nhánh chặn đăng ký trùng lặp user_id / email
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-721 [TC-CTV-08]: POST /api/affiliates/register - Người dùng đã có tài khoản CTV cố đăng ký lại trả về HTTP 400', async () => {
  const db = createMockDb([
    { id: 'aff-01', user_id: 'usr-102', email: 'ctv_active@gmail.com', status: 'active', ctv_code: 'CTV001' }
  ]);
  const user = { id: 'usr-102', email: 'ctv_active@gmail.com' };
  const payload = {
    full_name: 'Nguyễn Văn Đã Có',
    email: 'ctv_active@gmail.com',
    phone: '0912345678',
    bank_name: 'Vietcombank',
    bank_account: '1234567890',
    address: 'TP.HCM',
    dob: '1992-10-20'
  };

  const res = await processAffiliateRegistration(payload, user, db);

  assert.strictEqual(res.status, 400, 'Tài khoản CTV đã tồn tại phải bị từ chối với HTTP 400');
  assert.match(res.message, /đã đăng ký chương trình affiliate rồi/i, 'Thông báo lỗi phải rõ ràng');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-722
 * Tiêu đề: [TC-CTV-09] POST /api/affiliates/register - Tái kích hoạt tài khoản CTV bị rejected/terminated (HTTP 200)
 * Mã nguồn kiểm thử: backend/index.js (Dòng 2071-2088)
 * Độ bao phủ: Nhánh cho phép đăng ký lại khi status cũ là rejected hoặc terminated
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-722 [TC-CTV-09]: POST /api/affiliates/register - Tái kích hoạt tài khoản CTV bị rejected/terminated (HTTP 200)', async () => {
  const db = createMockDb([
    { 
      id: 'aff-01', 
      user_id: 'usr-103', 
      email: 'ctv_rejected@gmail.com', 
      status: 'rejected', 
      ctv_code: 'CTV009', 
      affiliate_link: 'http://localhost:3000?ref=CTV009' 
    }
  ]);
  const user = { id: 'usr-103', email: 'ctv_rejected@gmail.com' };
  const payload = {
    full_name: 'Nguyễn Văn Cập Nhật Lại',
    email: 'ctv_rejected@gmail.com',
    phone: '0988776655',
    bank_name: 'Techcombank',
    bank_account: '9988776655',
    address: 'Đà Nẵng',
    dob: '1994-08-12'
  };

  const res = await processAffiliateRegistration(payload, user, db);

  assert.strictEqual(res.status, 200, 'Đăng ký lại tài khoản bị từ chối phải trả HTTP 200');
  assert.strictEqual(res.ctv_code, 'CTV009', 'Phải bảo lưu mã ctv_code đã cấp trước đó');
  
  const recordInDb = db.records.find(r => r.user_id === 'usr-103');
  assert.strictEqual(recordInDb.status, 'pending', 'Trạng thái tài khoản phải được chuyển về pending để duyệt lại');
  assert.strictEqual(recordInDb.full_name, 'Nguyễn Văn Cập Nhật Lại', 'Thông tin cá nhân mới phải được cập nhật vào DB');
});

/**
 * ------------------------------------------------------------------------------
 * Subtask: ORD-723
 * Tiêu đề: [TC-CTV-10] POST /api/affiliates/register - Validation bắt buộc: thiếu thông tin bank, address, dob trả về HTTP 400
 * Mã nguồn kiểm thử: backend/index.js (Dòng 2061-2063)
 * Độ bao phủ: Nhánh if (!full_name || !email || !phone || !bank_name || ...)
 * ------------------------------------------------------------------------------
 */
Scenario('ORD-723 [TC-CTV-10]: POST /api/affiliates/register - Validation bắt buộc: thiếu thông tin bank, address, dob trả về HTTP 400', async () => {
  const db = createMockDb([]);
  const user = { id: 'usr-104', email: 'ctv_invalid@gmail.com' };

  // Case A: Thiếu bank_name
  const resA = await processAffiliateRegistration({
    full_name: 'Test', email: 'test@gmail.com', phone: '0912345678', bank_account: '123456', address: 'HN', dob: '1990-01-01'
  }, user, db);
  assert.strictEqual(resA.status, 400, 'Thiếu bank_name phải trả HTTP 400');
  assert.match(resA.message, /điền đầy đủ thông tin/i);

  // Case B: Thiếu bank_account
  const resB = await processAffiliateRegistration({
    full_name: 'Test', email: 'test@gmail.com', phone: '0912345678', bank_name: 'VCB', address: 'HN', dob: '1990-01-01'
  }, user, db);
  assert.strictEqual(resB.status, 400, 'Thiếu bank_account phải trả HTTP 400');

  // Case C: Thiếu dob (ngày sinh)
  const resC = await processAffiliateRegistration({
    full_name: 'Test', email: 'test@gmail.com', phone: '0912345678', bank_name: 'VCB', bank_account: '123456', address: 'HN'
  }, user, db);
  assert.strictEqual(resC.status, 400, 'Thiếu dob phải trả HTTP 400');
});
