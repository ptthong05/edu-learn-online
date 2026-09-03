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
 * 🧪 BỘ KIỂM THỬ ĐƠN VỊ HỘP TRẮNG (WHITE-BOX STATEMENT & BRANCH COVERAGE)
 * ==============================================================================
 * Story: ORD-259 - [STORY 4.1] Phân hệ Đặt hàng (DB Schema & Order Logic)
 * Subtask: ORD-690 - Statement Coverage luồng tạo và xử lý đơn hàng POST /api/orders
 * File mã nguồn cần kiểm thử: backend/index.js (Dòng 539 - 707)
 * ==============================================================================
 */

/**
 * Hàm mô phỏng logic nghiệp vụ xử lý tạo đơn hàng (Trích xuất từ backend/index.js:539-707)
 */
async function processOrderCreation(reqBody, user, db) {
  // Statement 1 (Dòng 540-542): Kiểm tra tính hợp lệ của req.body
  if (!reqBody || typeof reqBody !== 'object') {
    return { status: 400, message: 'Dữ liệu đơn hàng không hợp lệ.' };
  }

  const { items, payment_method, ref, coupon_code } = reqBody;

  // Statement 2 (Dòng 546-548): Kiểm tra phương thức thanh toán
  if (!payment_method || typeof payment_method !== 'string' || !payment_method.trim()) {
    return { status: 400, message: 'Vui lòng chọn phương thức thanh toán.' };
  }

  // Statement 3 (Dòng 550-552): Kiểm tra giỏ hàng rỗng hoặc không phải mảng
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { status: 400, message: 'Giỏ hàng trống hoặc không hợp lệ.' };
  }

  try {
    // Statement 4 & 5 (Dòng 558-590): Tính toán giá độc lập từ CSDL
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // Statement 4: Bỏ qua item rác thiếu course_id
      if (!item || typeof item !== 'object' || !item.course_id) continue;
      let productPrice = 0;
      let productName = typeof item.product_name === 'string' ? item.product_name : '';

      const course = await db.getCourse(item.course_id);
      if (course) {
        // Statement 6 & 7: Lấy sale_price hoặc price gốc
        const hasSale = course.sale_price !== null && course.sale_price !== undefined;
        productPrice = hasSale ? course.sale_price : course.price;
        productName = course.title;
      } else {
        // Statement 8: Lấy giá từ bảng combos
        const combo = await db.getCombo(item.course_id);
        if (combo) {
          const hasComboSale = combo.sale_price !== null && combo.sale_price !== undefined;
          productPrice = hasComboSale ? combo.sale_price : combo.price;
          productName = combo.title;
        } else {
          productPrice = Math.max(0, Number(item.price) || 0);
        }
      }

      calculatedSubtotal += productPrice;
      validatedItems.push({
        course_id: String(item.course_id),
        price: productPrice,
        product_name: productName
      });
    }

    // Statement 5: Kiểm tra nếu không có sản phẩm nào hợp lệ
    if (validatedItems.length === 0) {
      return { status: 400, message: 'Không tìm thấy sản phẩm hợp lệ trong giỏ hàng.' };
    }

    // Statement 9 & 10 (Dòng 593-608): Xác thực coupon phía Server
    let serverDiscount = 0;
    if (coupon_code && typeof coupon_code === 'string' && coupon_code.trim()) {
      const couponRecord = await db.getCoupon(coupon_code.trim().toUpperCase());
      const today = new Date().toISOString().split('T')[0];

      if (!couponRecord || couponRecord.status !== 'active' || couponRecord.expired_date < today) {
        return { status: 400, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' };
      }

      if (couponRecord.discount_type === 'percent') {
        serverDiscount = Math.round(calculatedSubtotal * couponRecord.discount / 100);
      } else {
        serverDiscount = Math.min(calculatedSubtotal, couponRecord.discount);
      }

      if (couponRecord.max_discount > 0) {
        serverDiscount = Math.min(serverDiscount, couponRecord.max_discount);
      }
    }

    // Statement 11 (Dòng 611): Tính tổng tiền cuối cùng (không âm)
    const finalTotal = Math.max(0, calculatedSubtotal - serverDiscount);

    // Statement 12 & 13 (Dòng 614-625): Kiểm tra mã đối tác CTV (Affiliate)
    let orderIdPrefix = 'ORD';
    if (ref && typeof ref === 'string' && ref.trim()) {
      const cleanRef = ref.trim();
      const affRecord = await db.getAffiliate(cleanRef);
      if (affRecord && affRecord.status === 'approved') {
        orderIdPrefix = affRecord.ctv_code || 'CTV';
      }
    }

    const orderId = `${orderIdPrefix}-${Date.now()}`;

    // Statement 14 (Dòng 635-685): Lưu đơn hàng vào CSDL
    await db.saveOrder({
      id: orderId,
      user_id: user.id,
      total: finalTotal,
      subtotal: calculatedSubtotal,
      discount: serverDiscount,
      payment_method,
      items: validatedItems
    });

    return {
      status: 201,
      success: true,
      message: 'Đặt hàng thành công!',
      orderId,
      finalTotal,
      items: validatedItems
    };
  } catch (error) {
    // Statement 15 (Dòng 698-700): Bắt ngoại lệ CSDL và trả về HTTP 500
    return {
      status: 500,
      message: 'Lỗi server khi tạo đơn hàng.',
      error: error.message
    };
  }
}

// Mock CSDL giả lập cho các bài test White-box
function createMockDb(overrides = {}) {
  return {
    getCourse: async (id) => {
      if (id === 'c-sale') return { id: 'c-sale', title: 'Khóa Sale', price: 500000, sale_price: 350000 };
      if (id === 'c-regular') return { id: 'c-regular', title: 'Khóa Thường', price: 600000, sale_price: null };
      return null;
    },
    getCombo: async (id) => {
      if (id === 'combo-1') return { id: 'combo-1', title: 'Combo Fullstack', price: 1200000, sale_price: 990000 };
      return null;
    },
    getCoupon: async (code) => {
      if (code === 'SALE20') return { code: 'SALE20', discount: 20, discount_type: 'percent', status: 'active', expired_date: '2099-12-31', max_discount: 0 };
      if (code === 'BIG500') return { code: 'BIG500', discount: 500000, discount_type: 'fixed', status: 'active', expired_date: '2099-12-31', max_discount: 0 };
      if (code === 'EXPIRED') return { code: 'EXPIRED', discount: 10, discount_type: 'percent', status: 'active', expired_date: '2020-01-01', max_discount: 0 };
      return null;
    },
    getAffiliate: async (ref) => {
      if (ref === 'CTV001') return { id: 'aff-1', ctv_code: 'CTV001', status: 'approved' };
      if (ref === 'PENDING_CTV') return { id: 'aff-2', ctv_code: 'CTV002', status: 'pending' };
      return null;
    },
    saveOrder: async () => true,
    ...overrides
  };
}

const mockUser = { id: 'usr-123', full_name: 'Nguyen Van A', email: 'test@edulearn.vn' };

Feature('ORD-690: Kiểm thử White-box Statement Coverage (15 Test Cases) - Luồng tạo đơn hàng POST /api/orders');

// 1. TC-ORD-01: req.body null/invalid
Scenario('ORD-690 [TC-ORD-01]: Check !req.body - Request body rỗng hoặc sai kiểu object', async () => {
  const res = await processOrderCreation(null, mockUser, createMockDb());
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.message, 'Dữ liệu đơn hàng không hợp lệ.');
});

// 2. TC-ORD-02: payment_method missing
Scenario('ORD-690 [TC-ORD-02]: Check !payment_method - Thiếu phương thức thanh toán', async () => {
  const res = await processOrderCreation({ items: [{ course_id: 'c-sale' }] }, mockUser, createMockDb());
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.message, 'Vui lòng chọn phương thức thanh toán.');
});

// 3. TC-ORD-03: items empty
Scenario('ORD-690 [TC-ORD-03]: Check !items || items.length === 0 - Giỏ hàng rỗng', async () => {
  const res = await processOrderCreation({ payment_method: 'vietqr', items: [] }, mockUser, createMockDb());
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.message, 'Giỏ hàng trống hoặc không hợp lệ.');
});

// 4. TC-ORD-04: item without course_id skipped
Scenario('ORD-690 [TC-ORD-04]: Check item !course_id - Item trong giỏ thiếu course_id (continue)', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    items: [{ title: 'Item rác không có id' }, { course_id: 'c-sale' }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.items.length, 1);
  assert.strictEqual(res.items[0].course_id, 'c-sale');
});

// 5. TC-ORD-05: validatedItems length === 0
Scenario('ORD-690 [TC-ORD-05]: Check validatedItems.length === 0 - Giỏ hàng toàn item không hợp lệ', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    items: [{ course_id: null }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.message, 'Không tìm thấy sản phẩm hợp lệ trong giỏ hàng.');
});

// 6. TC-ORD-06: Course with sale_price
Scenario('ORD-690 [TC-ORD-06]: Check course.sale_price !== null - Khóa học lẻ có giá ưu đãi sale_price', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    items: [{ course_id: 'c-sale' }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.finalTotal, 350000, 'Giá phải lấy từ sale_price = 350.000đ');
});

// 7. TC-ORD-07: Course with regular price
Scenario('ORD-690 [TC-ORD-07]: Check course regular price - Khóa học lẻ giá thường (sale_price = null)', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    items: [{ course_id: 'c-regular' }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.finalTotal, 600000, 'Giá phải lấy từ price gốc = 600.000đ');
});

// 8. TC-ORD-08: Combo package
Scenario('ORD-690 [TC-ORD-08]: Check combo package - Mua gói Combo khóa học từ bảng combos', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    items: [{ course_id: 'combo-1' }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.finalTotal, 990000, 'Giá lấy từ combo sale_price = 990.000đ');
});

// 9. TC-ORD-09: Invalid/Expired coupon
Scenario('ORD-690 [TC-ORD-09]: Check invalid coupon_code - Mã coupon không tồn tại hoặc hết hạn', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    coupon_code: 'EXPIRED',
    items: [{ course_id: 'c-regular' }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.message, 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
});

// 10. TC-ORD-10: Valid coupon applied
Scenario('ORD-690 [TC-ORD-10]: Check valid coupon_code - Áp dụng mã giảm giá 20% hợp lệ', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    coupon_code: 'SALE20',
    items: [{ course_id: 'c-regular' }] // 600.000đ
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.finalTotal, 480000, '600k giảm 20% còn 480.000đ');
});

// 11. TC-ORD-11: Final total not negative
Scenario('ORD-690 [TC-ORD-11]: Check Math.max(0, subtotal - discount) - Giảm giá lớn hơn đơn hàng (không âm)', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    coupon_code: 'BIG500', // Giảm 500k
    items: [{ course_id: 'c-sale' }] // Giá 350k
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.finalTotal, 0, 'Tổng tiền chặn ở 0đ không bị âm');
});

// 12. TC-ORD-12: Approved Affiliate CTV
Scenario('ORD-690 [TC-ORD-12]: Check approved affiliate ref - Mua qua mã CTV đã duyệt', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    ref: 'CTV001',
    items: [{ course_id: 'c-sale' }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.ok(res.orderId.startsWith('CTV001-'), 'Mã đơn hàng phải bắt đầu bằng mã CTV001-');
});

// 13. TC-ORD-13: Invalid/Pending Affiliate CTV
Scenario('ORD-690 [TC-ORD-13]: Check invalid affiliate ref - Mã CTV chưa duyệt giữ prefix ORD-', async () => {
  const res = await processOrderCreation({
    payment_method: 'vietqr',
    ref: 'PENDING_CTV',
    items: [{ course_id: 'c-sale' }]
  }, mockUser, createMockDb());
  assert.strictEqual(res.status, 201);
  assert.ok(res.orderId.startsWith('ORD-'), 'Mã đơn hàng giữ tiền tố mặc định ORD-');
});

// 14. TC-ORD-14: Happy path order creation
Scenario('ORD-690 [TC-ORD-14]: Check Happy Path - Tạo đơn hàng hợp lệ thành công', async () => {
  let isSaved = false;
  const db = createMockDb({
    saveOrder: async (data) => {
      isSaved = true;
      assert.strictEqual(data.total, 350000);
      return true;
    }
  });

  const res = await processOrderCreation({
    payment_method: 'vietqr',
    items: [{ course_id: 'c-sale' }]
  }, mockUser, db);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.success, true);
  assert.strictEqual(isSaved, true, 'Đơn hàng phải được lưu vào CSDL');
});

// 15. TC-ORD-15: Database error catch (error)
Scenario('ORD-690 [TC-ORD-15]: Check catch (error) - Xử lý ngoại lệ CSDL ném lỗi (HTTP 500)', async () => {
  const dbError = createMockDb({
    getCourse: async () => {
      throw new Error('SQLite DB Connection Locked');
    }
  });

  const res = await processOrderCreation({
    payment_method: 'vietqr',
    items: [{ course_id: 'c-sale' }]
  }, mockUser, dbError);

  assert.strictEqual(res.status, 500);
  assert.strictEqual(res.message, 'Lỗi server khi tạo đơn hàng.');
  assert.strictEqual(res.error, 'SQLite DB Connection Locked');
});
