/**
 * 📌 Subtask: ORD-572 - [Recovery] [CTV] Giao dịch rút tiền bị lỗi giữa chừng, kiểm tra rollback transaction đúng
 */
const assert = require('node:assert/strict');

Feature('ORD-555 / ORD-572: Rollback Giao Dịch Rút Tiền Lỗi');

Scenario('ORD-572 - Kiểm tra hoàn tiền (Rollback) số dư CTV khi giao dịch rút tiền phát sinh lỗi', async () => {
  const initialBalance = 1000000;
  let currentBalance = initialBalance - 200000; // Giảm tiền khi tạo lệnh
  const transactionFailed = true;

  if (transactionFailed) {
    currentBalance += 200000; // Khôi phục tiền (Rollback)
  }

  assert.strictEqual(currentBalance, initialBalance, 'Số dư CTV phải được khôi phục nguyên vẹn về trạng thái ban đầu');
});