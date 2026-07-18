-- Create payment_methods table for admin to manage payment information
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  method_key TEXT UNIQUE NOT NULL,
  method_name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  account_number TEXT,
  account_holder TEXT,
  bank_name TEXT,
  qr_code_image TEXT,
  phone_number TEXT,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Insert default payment methods
INSERT OR REPLACE INTO payment_methods (id, method_key, method_name, icon, description, account_number, account_holder, bank_name, qr_code_image, phone_number, is_active, display_order, created_at, updated_at)
VALUES 
  ('pm-001', 'momo', 'Ví MoMo', '🟣', 'Thanh toán nhanh qua MoMo', NULL, 'Phạm Tấn Thông', NULL, NULL, '0901234567', 1, 1, datetime('now'), datetime('now')),
  ('pm-002', 'banking', 'Thẻ ATM / Internet Banking', '🏧', 'Chuyển khoản qua ATM', '0377987457', 'Phạm Tấn Thông', 'MB Bank - Ngân hàng Quân đội', NULL, NULL, 1, 2, datetime('now'), datetime('now')),
  ('pm-003', 'qr_banking', 'QR Code Ngân hàng', '🏦', 'Quét mã QR để thanh toán', '0377987457', 'Phạm Tấn Thông', 'MB Bank - VietQR', NULL, NULL, 1, 3, datetime('now'), datetime('now'));
