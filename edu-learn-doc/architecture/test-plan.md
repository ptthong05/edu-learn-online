# Kế Hoạch Kiểm Thử Toàn Diện (Master Test Plan v1.0)

> **Dự án:** EduLearn Online - Nền tảng Học trực tuyến & Tiếp thị liên kết  
> **Mã tài liệu:** `TP-EDULEARN-2026-V1.0`  
> **Phiên bản:** 1.0 (Chính thức)  
> **Ngày lập:** 30/08/2026  
> **Người lập:** Phạm Tấn Thông (Project Manager / Dev Lead)  
> **Người kiểm duyệt:** quangnh0472 (QA Lead)  

---

## 1. Giới thiệu tổng quan (Introduction)

### 1.1 Mục đích tài liệu
Tài liệu này xác định mục tiêu, phạm vi, chiến lược, môi trường, nguồn lực, tiêu chuẩn chất lượng và lịch trình thực hiện kiểm thử cho toàn bộ hệ thống **EduLearn Online**. Tài liệu này làm cơ sở cho hoạt động Static Review theo ticket **ORD-497**.

### 1.2 Mục tiêu chất lượng hệ thống
* Đảm bảo tính đúng đắn của toàn bộ quy trình nghiệp vụ: Đăng ký/Đăng nhập, Quản lý Khóa học, Áp dụng Mã giảm giá, Đặt hàng & Thanh toán, Hệ thống Hoa hồng Tiếp thị liên kết (Affiliate).
* Đảm bảo an toàn, bảo mật thông tin tài khoản và toàn vẹn cơ sở dữ liệu (Toàn vẹn ràng buộc Foreign Key, Check Constraints, Indexes).
* Tỷ lệ Test Case đạt yêu cầu (Pass Rate) tối thiểu **95%**.
* **0** lỗi ở mức độ nghiêm trọng (Blocker / Critical).

---

## 2. Phạm vi kiểm thử (Scope of Testing)

### 2.1 Các phân hệ nằm trong phạm vi (In-Scope)

| STT | Phân hệ (Module) | Mô tả chi tiết chức năng kiểm thử |
| :---: | :--- | :--- |
| **1** | **Xác thực & Người dùng (`Auth & User`)** | • Đăng ký tài khoản mới, xác thực email, mã hóa mật khẩu Bcrypt.<br>• Đăng nhập JWT Token, đổi mật khẩu, quên mật khẩu (Reset Token).<br>• Phân quyền RBAC (Role: `USER`, `STAFF`, `MANAGER`, `AFFILIATE`).<br>• Khóa tài khoản (`status = 'blocked'`). |
| **2** | **Khóa học & Danh mục (`Courses & Categories`)** | • Xem danh sách khóa học, lọc theo danh mục, tìm kiếm, sắp xếp theo giá.<br>• Xem chi tiết khóa học, giáo trình bài học, video demo, đánh giá review.<br>• Quản trị CMS khóa học: Thêm/Sửa/Ẩn/Xóa (Admin).<br>• Gói khóa học Combo (`combos`, `combo_details`). |
| **3** | **Mã giảm giá (`Coupons`)** | • Kiểm tra tính hợp lệ của mã (`/api/coupons/validate`).<br>• Giảm giá theo % hoặc số tiền cố định (`discount_type`).<br>• Ràng buộc: Số lượng (`quantity`), Hạn dùng (`expired_date`), Đơn hàng tối thiểu (`min_order_amount`), Giảm tối đa (`max_discount`). |
| **4** | **Đơn hàng & Thanh toán (`Orders & Payments`)** | • Tạo đơn hàng (`orders`), chi tiết đơn hàng (`order_details`).<br>• Cổng thanh toán: MoMo, Chuyển khoản ngân hàng, VietQR Code.<br>• Upload chứng từ chuyển khoản (`payment_proof`).<br>• Duyệt đơn hàng: Cập nhật `status` (`pending`, `completed`, `cancelled`) và `payment_status` (`chua_thanh_toan`, `da_thanh_toan`).<br>• Ràng buộc CSDL: `ON DELETE RESTRICT`, `CHECK constraint`, `INDEX`. |
| **5** | **Tiếp thị liên kết (`Affiliate Program`)** | • Đăng ký CTV, duyệt tài khoản CTV, cấp mã `ctv_code` và `affiliate_link`.<br>• Tracking lượt click link tiếp thị (`affiliate_clicks`).<br>• Tự động tính hoa hồng (`affiliate_revenues`) khi đơn hàng hoàn tất.<br>• Tạo và duyệt yêu cầu rút tiền (`withdrawal_requests`) về ngân hàng.<br>• Cấu hình tỷ lệ hoa hồng theo khóa học (`affiliate_commissions`). |

### 2.2 Các hạng mục ngoài phạm vi (Out-of-Scope)
* Kiểm thử tải chịu tải đồng thời trên 1.000.000 người dùng (Stress Test quy mô lớn) trong giai đoạn v1.0.
* Tích hợp cổng thanh toán quốc tế (PayPal, Stripe) - dự kiến ở v2.0.

---

## 3. Chiến lược kiểm thử (Testing Strategy)

### 3.1 Các cấp độ kiểm thử (Testing Levels)
1. **Kiểm thử tĩnh (Static Review / Inspection):**
   * Rà soát tài liệu thiết kế CSDL (ERD, Foreign Key, Constraints, Indexing).
   * Rà soát cấu trúc mã nguồn Backend và tài liệu API.
2. **Kiểm thử đơn vị & Tích hợp (Unit & Integration Testing):**
   * Kiểm thử các hàm xử lý mã hóa, tính toán hoa hồng, áp dụng mã giảm giá.
   * Kiểm thử các API Endpoint với bộ Postman Collection & Newman.
3. **Kiểm thử hệ thống (System Testing):**
   * Kiểm thử chức năng toàn diện từ giao diện Frontend (React/Vue/HTML) tới CSDL Backend.
4. **Kiểm thử chấp nhận người dùng (User Acceptance Testing - UAT):**
   * Thực hiện theo các kịch bản trải nghiệm người dùng thực tế (End-to-End User Journeys).

### 3.2 Kỹ thuật thiết kế Test Case
* **Phân vùng tương đương (Equivalence Partitioning):** Kiểm tra các khoảng giá trị hợp lệ/không hợp lệ.
* **Phân tích giá trị biên (Boundary Value Analysis - BVA):** Kiểm tra giới hạn số lượng coupon, số tiền rút tối thiểu/tối đa.
* **Bảng quyết định (Decision Table Testing):** Kiểm tra các tổ hợp điều kiện áp dụng mã giảm giá và quyền hạn RBAC.
* **Phân tích chuyển đổi trạng thái (State Transition Testing):** Kiểm tra luồng trạng thái đơn hàng (`pending` $\rightarrow$ `completed` / `cancelled`).

---

## 4. Môi trường & Công cụ kiểm thử (Environment & Tools)

### 4.1 Môi trường kiểm thử
* **Môi trường Local / Staging:** Docker Compose Container (`edu-learn-online-backend`, `edu-learn-online-frontend`).
* **Hệ điều hành:** Windows 11 / Linux Ubuntu 22.04.
* **Cơ sở dữ liệu:** SQLite v3 (Đã bật `PRAGMA foreign_keys = ON;`).
* **Trình duyệt kiểm thử:** Google Chrome v128+, Microsoft Edge, Mozilla Firefox.

### 4.2 Công cụ kiểm thử (Testing Tools)
* **API Testing & Automation:** Postman Collection (`EduLearnOnline.postman_collection.json`), Newman CLI.
* **UI End-to-End Automation:** CodeceptJS, WebDriver / Playwright.
* **Database Inspection:** DBeaver Community, SQLite3 CLI, Node.js Test Scripts.
* **Quản lý lỗi & Tiến độ:** Atlassian Jira Cloud (Project `ORD`, Board `44`).

### 4.3 Dữ liệu kiểm thử & Tài khoản phân quyền
| Loại tài khoản | Email mẫu | Mật khẩu mẫu | Vai trò / Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Manager (Admin)** | `manager@edulearn.vn` | `admin123` | Toàn quyền hệ thống, duyệt rút tiền, cấu hình CMS |
| **Staff (Nhân viên)** | `staff@edulearn.vn` | `staff123` | Quản lý khóa học, duyệt đơn hàng, viết blog |
| **User (Học viên)** | `tuan.nguyen@gmail.com` | `user123` | Mua khóa học, xem bài học, đánh giá review |
| **Affiliate (CTV)** | `ctv@edulearn.vn` | `ctv123` | Lấy link tiếp thị, theo dõi doanh thu, yêu cầu rút tiền |

---

## 5. Tiêu chuẩn dừng & Chấp nhận chất lượng (Exit & Acceptance Criteria)

### 5.1 Tiêu chí chấp nhận (Acceptance Criteria)
* 100% các Test Case chính (Critical / High Priority) được thực thi và có trạng thái **PASSED**.
* Tỷ lệ Test Case đạt tổng thể $\ge \mathbf{95\%}$.
* **0** lỗi nghiêm trọng mức độ **Blocker** hoặc **Critical**.
* Toàn bộ các lỗi phát hiện qua Static Review (`ORD-598`, `ORD-599`, `ORD-600`) đã được khắc phục triệt để và kiểm chứng đạt.

### 5.2 Tiêu chí tạm dừng & Phục hồi kiểm thử (Suspension & Resumption)
* **Tạm dừng khi:** Có lỗi sập máy chủ Backend (Crash / 500) trên diện rộng hoặc CSDL bị lỗi cấu trúc ngăn cản việc chạy test.
* **Phục hồi khi:** Bản vá lỗi (Hotfix) đã được triển khai và xác nhận hoạt động ổn định trên môi trường Test.

