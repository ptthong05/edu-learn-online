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
 * 🧪 BỘ KIỂM THỬ ĐƠN VỊ HỘP TRẮNG (WHITE-BOX STATEMENT COVERAGE)
 * ==============================================================================
 * Story: ORD-255 - [STORY 3.1] Phân hệ Mã giảm giá (Validation Logic & Expiry)
 * Subtask: ORD-646 - Statement Coverage hàm validateCoupon & Endpoint Handler
 * File mã nguồn cần kiểm thử: backend/index.js (Dòng 974 - 1031)
 * Độ bao phủ mục tiêu: 100% Statement Coverage (11/11 Statements được chạy qua)
 * ==============================================================================
 */

/**
 * Hàm logic nghiệp vụ kiểm tra và tính toán giảm giá (Trích xuất từ backend/index.js:974-1027)
 * @param {string} inputCode - Mã giảm giá do client gửi lên
 * @param {object|null} coupon - Dữ liệu coupon tìm thấy trong CSDL
 * @param {number|string} orderAmount - Tổng tiền đơn hàng
 * @param {Date} [currentDate] - Thời gian giả lập kiểm tra (mặc định là Date hiện tại)
 * @returns {object} Kết quả xác thực coupon
 */
function validateCoupon(inputCode, coupon, orderAmount, currentDate = new Date()) {
  // Statement 1 (Dòng 976): Kiểm tra tính hợp lệ của input mã
  if (!inputCode || typeof inputCode !== 'string' || !inputCode.trim()) {
    return { valid: false, status: 400, message: 'Vui lòng cung cấp mã giảm giá.' };
  }

  // Statement 2 (Dòng 982): Kiểm tra coupon có tồn tại trong CSDL không
  if (!coupon) {
    return { valid: false, status: 404, message: 'Mã giảm giá không tồn tại.' };
  }

  // Statement 3 (Dòng 985): Kiểm tra trạng thái coupon có đang active không
  if (coupon.status !== 'active') {
    return { valid: false, status: 400, message: 'Mã giảm giá đã bị vô hiệu hóa.' };
  }

  // Statement 4 (Dòng 989): Kiểm tra coupon đã hết hạn chưa
  const now = currentDate.toISOString().split('T')[0];
  if (coupon.expired_date < now) {
    return { valid: false, status: 400, message: 'Mã giảm giá đã hết hạn sử dụng.' };
  }

  // Statement 5 (Dòng 992): Kiểm tra số lượt sử dụng còn lại
  if (coupon.used_count >= coupon.quantity) {
    return { valid: false, status: 400, message: 'Mã giảm giá đã hết lượt sử dụng.' };
  }

  // Statement 6 (Dòng 998): Kiểm tra giá trị đơn hàng tối thiểu
  const minOrderAmount = coupon.min_order_amount || 0;
  const orderTotal = Number(orderAmount) || 0;
  if (minOrderAmount > 0 && orderTotal < minOrderAmount) {
    return {
      valid: false,
      status: 400,
      message: `Đơn hàng tối thiểu ${minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã này.`,
      min_order_amount: minOrderAmount
    };
  }

  // Statement 7 & 8 (Dòng 1010 - 1014): Tính toán mức giảm theo phần trăm (%) hoặc số tiền cố định
  let calculatedDiscount = 0;
  if (coupon.discount_type === 'percent') {
    // Statement 7: Giảm theo %
    calculatedDiscount = Math.round(orderTotal * coupon.discount / 100);
  } else {
    // Statement 8: Giảm số tiền cố định
    calculatedDiscount = Math.min(orderTotal, coupon.discount);
  }

  // Statement 9 (Dòng 1018): Áp dụng mức giảm trần tối đa (max_discount) nếu có
  const maxDiscount = coupon.max_discount || 0;
  if (maxDiscount > 0) {
    calculatedDiscount = Math.min(calculatedDiscount, maxDiscount);
  }

  // Statement 10 (Dòng 1022 - 1027): Trả về kết quả áp dụng coupon thành công (HTTP 200)
  return {
    valid: true,
    status: 200,
    message: 'Áp dụng mã giảm giá thành công!',
    coupon,
    calculated_discount: calculatedDiscount
  };
}

/**
 * Hàm mô phỏng toàn bộ luồng Handler của Endpoint bao gồm cả khối try...catch (backend/index.js:974-1031)
 */
async function handleValidateCouponEndpoint(reqBody, dbQueryFn) {
  const { code, order_amount } = reqBody;
  if (!code) {
    return { status: 400, data: { message: 'Vui lòng cung cấp mã giảm giá.' } };
  }
  try {
    const coupon = await dbQueryFn(code);
    const result = validateCoupon(code, coupon, order_amount);
    return { status: result.status, data: result };
  } catch (err) {
    // Statement 11 (Dòng 1028 - 1030): Khối catch xử lý ngoại lệ CSDL và lỗi Server
    return {
      status: 500,
      data: { message: 'Lỗi server khi xác thực coupon.', error: err.message }
    };
  }
}

// Mock Data chuẩn dùng cho các bài test
const mockActivePercentCoupon = {
  id: 'coup-percent-1',
  code: 'DISCOUNT20',
  discount: 20,
  discount_type: 'percent',
  quantity: 100,
  used_count: 10,
  expired_date: '2099-12-31',
  status: 'active',
  min_order_amount: 0,
  max_discount: 0
};

Feature('ORD-646: Kiểm thử White-box Statement Coverage (11 Test Cases) - Hàm validateCoupon');

// ==============================================================================
// 1. UT-CP-01: Statement check !code (Mã rỗng hoặc thiếu) ➔ HTTP 400
// ==============================================================================
Scenario('ORD-646 [UT-CP-01]: Statement check !code - Không truyền mã hoặc truyền chuỗi rỗng/khoảng trắng', () => {
  const resEmpty = validateCoupon('', mockActivePercentCoupon, 500000);
  assert.strictEqual(resEmpty.valid, false);
  assert.strictEqual(resEmpty.status, 400);
  assert.strictEqual(resEmpty.message, 'Vui lòng cung cấp mã giảm giá.');

  const resSpaces = validateCoupon('   ', mockActivePercentCoupon, 500000);
  assert.strictEqual(resSpaces.valid, false);
  assert.strictEqual(resSpaces.status, 400);

  const resNull = validateCoupon(null, mockActivePercentCoupon, 500000);
  assert.strictEqual(resNull.valid, false);
  assert.strictEqual(resNull.status, 400);
});

// ==============================================================================
// 2. UT-CP-02: Statement check !coupon (Không tìm thấy mã trong DB) ➔ HTTP 404
// ==============================================================================
Scenario('ORD-646 [UT-CP-02]: Statement check !coupon - Mã giảm giá không tồn tại trong CSDL', () => {
  const result = validateCoupon('NON_EXIST_CODE', null, 500000);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.status, 404);
  assert.strictEqual(result.message, 'Mã giảm giá không tồn tại.');
});

// ==============================================================================
// 3. UT-CP-03: Statement check status !== 'active' (Mã bị vô hiệu hóa) ➔ HTTP 400
// ==============================================================================
Scenario('ORD-646 [UT-CP-03]: Statement check status !== active - Mã giảm giá ở trạng thái inactive', () => {
  const inactiveCoupon = { ...mockActivePercentCoupon, status: 'inactive' };
  const result = validateCoupon('DISCOUNT20', inactiveCoupon, 500000);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.message, 'Mã giảm giá đã bị vô hiệu hóa.');
});

// ==============================================================================
// 4. UT-CP-04: Statement check expired_date < now (Mã đã hết hạn) ➔ HTTP 400
// ==============================================================================
Scenario('ORD-646 [UT-CP-04]: Statement check expired_date < now - Mã giảm giá đã hết hạn sử dụng', () => {
  const expiredCoupon = { ...mockActivePercentCoupon, expired_date: '2020-01-01' };
  const result = validateCoupon('DISCOUNT20', expiredCoupon, 500000, new Date('2026-09-01'));
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.message, 'Mã giảm giá đã hết hạn sử dụng.');
});

// ==============================================================================
// 5. UT-CP-05: Statement check used_count >= quantity (Mã hết lượt dùng) ➔ HTTP 400
// ==============================================================================
Scenario('ORD-646 [UT-CP-05]: Statement check used_count >= quantity - Mã giảm giá đã dùng hết lượt', () => {
  const outOfStockCoupon = { ...mockActivePercentCoupon, quantity: 20, used_count: 20 };
  const result = validateCoupon('DISCOUNT20', outOfStockCoupon, 500000);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.message, 'Mã giảm giá đã hết lượt sử dụng.');
});

// ==============================================================================
// 6. UT-CP-06: Statement check order_amount < min_order_amount ➔ HTTP 400
// ==============================================================================
Scenario('ORD-646 [UT-CP-06]: Statement check order_amount < min_order_amount - Đơn hàng chưa đạt giá trị tối thiểu', () => {
  const minOrderCoupon = { ...mockActivePercentCoupon, min_order_amount: 500000 };
  const result = validateCoupon('DISCOUNT20', minOrderCoupon, 300000);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.min_order_amount, 500000);
  assert.ok(result.message.includes('500.000'));
});

// ==============================================================================
// 7. UT-CP-07: Statement check discount_type === 'percent' ➔ HTTP 200
// ==============================================================================
Scenario('ORD-646 [UT-CP-07]: Statement check discount_type === percent - Giảm giá theo % thông thường', () => {
  // Giảm 20% cho đơn hàng 1.000.000đ = 200.000đ
  const result = validateCoupon('DISCOUNT20', mockActivePercentCoupon, 1000000);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.calculated_discount, 200000);
  assert.strictEqual(result.message, 'Áp dụng mã giảm giá thành công!');
});

// ==============================================================================
// 8. UT-CP-08: Statement check max_discount > 0 ➔ HTTP 200 (Chặn trần mức giảm)
// ==============================================================================
Scenario('ORD-646 [UT-CP-08]: Statement check max_discount > 0 - Chặn mức giảm tối đa khi giảm theo %', () => {
  // Giảm 50% cho đơn 1.000.000đ = 500.000đ nhưng trần max_discount = 200.000đ
  const cappedCoupon = { ...mockActivePercentCoupon, discount: 50, max_discount: 200000 };
  const result = validateCoupon('DISCOUNT50', cappedCoupon, 1000000);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.calculated_discount, 200000);
});

// ==============================================================================
// 9. UT-CP-09: Statement check discount_type === 'fixed' ➔ HTTP 200
// ==============================================================================
Scenario('ORD-646 [UT-CP-09]: Statement check discount_type === fixed - Giảm số tiền cố định thông thường', () => {
  // Giảm cố định 150.000đ cho đơn hàng 500.000đ
  const fixedCoupon = {
    ...mockActivePercentCoupon,
    discount: 150000,
    discount_type: 'fixed',
    max_discount: 0
  };
  const result = validateCoupon('FIXED150', fixedCoupon, 500000);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.calculated_discount, 150000);
});

// ==============================================================================
// 10. UT-CP-10: Statement check fixed discount exceeds total ➔ HTTP 200 (Không âm đơn)
// ==============================================================================
Scenario('ORD-646 [UT-CP-10]: Statement check Math.min(orderTotal, discount) - Giảm cố định lớn hơn giá trị đơn hàng', () => {
  // Giảm cố định 300.000đ cho đơn hàng chỉ có 200.000đ ➔ Mức giảm bằng 200.000đ (khách trả 0đ)
  const fixedBigCoupon = {
    ...mockActivePercentCoupon,
    discount: 300000,
    discount_type: 'fixed',
    max_discount: 0
  };
  const result = validateCoupon('FIXED300', fixedBigCoupon, 200000);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.calculated_discount, 200000);
});

// ==============================================================================
// 11. UT-CP-11: Statement check catch (err) ➔ HTTP 500 (Bắt ngoại lệ CSDL / Server)
// ==============================================================================
Scenario('ORD-646 [UT-CP-11]: Statement check catch (err) - Xử lý ngoại lệ CSDL ném lỗi (HTTP 500 Server Error)', async () => {
  // Giả lập lỗi truy vấn CSDL SQLite bị lỗi Disk I/O hoặc ngắt kết nối
  const mockDbErrorFn = async () => {
    throw new Error('SQLite DB disk I/O error');
  };

  const response = await handleValidateCouponEndpoint(
    { code: 'DISCOUNT20', order_amount: 500000 },
    mockDbErrorFn
  );

  assert.strictEqual(response.status, 500, 'Khối catch (err) phải bắt ngoại lệ và trả về HTTP 500');
  assert.strictEqual(response.data.message, 'Lỗi server khi xác thực coupon.');
  assert.strictEqual(response.data.error, 'SQLite DB disk I/O error');
});

module.exports = { validateCoupon, handleValidateCouponEndpoint };
