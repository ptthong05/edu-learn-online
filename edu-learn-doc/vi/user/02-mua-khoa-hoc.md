# Hướng dẫn Mua Khóa học & Thanh toán

Tài liệu hướng dẫn chi tiết quy trình tìm kiếm, chọn mua khóa học, áp dụng mã giảm giá (Coupon), nhập mã giới thiệu CTV, thanh toán quét mã QR/Chuyển khoản và nộp minh chứng đơn hàng.

---

## 1. Tìm kiếm và Lựa chọn Khóa học

### 1.1 Khám phá danh sách khóa học (`/courses`)
- **Tìm kiếm thông minh**: Nhập từ khóa tên khóa học, giảng viên hoặc chủ đề tại thanh tìm kiếm.
- **Lọc theo danh mục**: Chọn theo các chủ đề: *Lập trình Web, UI/UX Design, Data Science, Marketing, Python...*
- **Sắp xếp linh hoạt**: Sắp xếp theo giá (thấp đến cao / cao đến thấp), khóa học mới nhất, hoặc được đánh giá cao nhất.

### 1.2 Xem chi tiết khóa học
- Xem video giới thiệu (Intro video), hình ảnh thumbnail khóa học.
- Xem danh sách giáo trình chi tiết (Curriculum) và các bài giảng.
- Đọc các điểm nổi bật (Highlights) và đánh giá (Reviews) từ học viên thực tế.

---

## 2. Quy trình Mua hàng & Thanh toán

```
+-------------------+      +-------------------+      +---------------------+      +---------------------+
| 1. Chọn khóa học  | ---> | 2. Giỏ hàng /     | ---> | 3. Thanh toán       | ---> | 4. Nộp biên lai &   |
| (Thêm giỏ/Mua ngay)      |    Kiểm tra Coupon|      | (Chọn PTTT, Quét QR)|      |    Chờ duyệt (PASS) |
+-------------------+      +-------------------+      +---------------------+      +---------------------+
```

### Bước 1: Thêm vào Giỏ hàng hoặc Mua ngay
- **Thêm vào giỏ**: Nhấn nút **Thêm vào giỏ** để lưu khóa học và tiếp tục duyệt các khóa học khác.
- **Mua ngay**: Nhấn nút **Mua ngay** để lưu đơn mua vào phiên tạm thời (`sessionStorage`) và chuyển thẳng đến trang **Thanh toán (`/checkout?buynow=true`)**.

### Bước 2: Quản lý Giỏ hàng (`/cart`)
- Kiểm tra danh sách các khóa học đã chọn mua.
- Xóa bớt các khóa học không có nhu cầu.
- Xem tổng tiền tạm tính và nhấn nút **Tiến hành thanh toán**.

### Bước 3: Hoàn tất đơn hàng tại trang Thanh toán (`/checkout`)

Tại trang thanh toán, hệ thống cung cấp giao diện tích hợp trực quan:

```
+-----------------------------------------------------------------------------------+
|                                 TRANG THANH TOÁN                                  |
+-------------------------------------------------+---------------------------------+
|  THÔNG TIN THANH TOÁN                           |  ĐƠN HÀNG CỦA BẠN               |
|                                                 |                                 |
|  1. Chọn phương thức thanh toán:                |  • Khóa học Lập trình Web       |
|     (•) 🏦 QR Code Ngân hàng (VietQR tự động)   |    Giá: 790.000 đ               |
|     ( ) 🏧 Thẻ ATM / Internet Banking           |                                 |
|     ( ) 🟣 Ví MoMo                              |  -----------------------------  |
|                                                 |  Tạm tính:         790.000 đ    |
|  2. Mã giới thiệu CTV (nếu có):                 |  Mã CTV:           [ CTV123   ] |
|     [ CTV123             ] [ Áp dụng ]          |  Mã giảm giá:      [ SALE30   ] |
|     (Tự động ghi nhận nếu vào từ link CTV)      |  Giảm giá (30%):  - 237.000 đ   |
|                                                 |  -----------------------------  |
|  3. Mã giảm giá (Voucher):                      |  TỔNG CỘNG:        553.000 đ    |
|     [ SALE30             ] [ Áp dụng ]          |                                 |
|                                                 |  [       ĐẶT HÀNG NGAY       ]  |
+-------------------------------------------------+---------------------------------+
```

#### Các tính năng tại trang Thanh toán:
1. **Phương thức thanh toán**:
   * **QR Code Ngân hàng**: Tự động sinh mã VietQR với số tiền đã trừ khuyến mãi và nội dung chuyển khoản là mã đơn hàng duy nhất.
   * **Chuyển khoản Internet Banking**: Hiển thị số tài khoản, tên chủ tài khoản và ngân hàng nhận.
   * **Ví MoMo**: Hiển thị số điện thoại nhận tiền MoMo.
2. **Mã giảm giá (Coupon/Voucher)**:
   * Nhập mã voucher khuyến mãi (ví dụ `SALE30`) và nhấn **Áp dụng**.
   * Hệ thống tự động tính toán số tiền giảm trừ vào tổng đơn hàng theo điều kiện của mã.
3. **Mã giới thiệu Cộng tác viên (Affiliate / CTV Code)**:
   * Nếu bạn truy cập qua link giới thiệu CTV, hệ thống sẽ tự động điền mã giới thiệu.
   * Người mua cũng có thể tự nhập mã CTV thủ công để ủng hộ người giới thiệu.

### Bước 4: Đặt hàng & Nộp bằng chứng thanh toán
1. Nhấn nút **Đặt hàng ngay**. Hệ thống sẽ tạo đơn hàng với mã định danh (ví dụ `ORD-1725000000` hoặc `CTV-1725000000`).
2. Thực hiện chuyển khoản qua app ngân hàng hoặc quét mã QR hiển thị trên màn hình.
3. **Tải lên ảnh chụp biên lai giao dịch thành công (Payment Proof)**:
   * Nhấn nút **Chọn ảnh biên lai** và tải lên ảnh chụp màn hình xác nhận chuyển khoản.
   * Nhấn **Xác nhận nộp biên lai**.

```
+-------------------------------------------------------------+
|               NỘP MINH CHỨNG THANH TOÁN                     |
|                                                             |
|   Mã đơn hàng: ORD-20260831-99                              |
|   Số tiền cần chuyển: 553.000 đ                             |
|                                                             |
|   [ Chọn tệp ảnh biên lai chuyển khoản (JPG/PNG/WEBP) ]     |
|   [                  NỘP MINH CHỨNG                   ]     |
|                                                             |
|   ℹ️ Ban quản trị sẽ đối soát và kích hoạt trong 5-15 phút. |
+-------------------------------------------------------------+
```

### Bước 5: Kích hoạt khóa học
- Đơn hàng sau khi đặt thành công sẽ ở trạng thái **Chờ duyệt (`pending`)** và trạng thái thanh toán **Chưa thanh toán (`chua_thanh_toan`)**.
- Quản trị viên (Admin/Staff) sẽ đối soát biên lai và duyệt đơn sang trạng thái **Đã xong (`completed`)** và **Đã thanh toán (`da_thanh_toan`)**.
- Ngay sau khi được duyệt, khóa học sẽ xuất hiện ngay trong mục **Khóa học của tôi (`/my-courses`)** để bạn bắt đầu học tập không giới hạn.

---

## 3. Mua Gói Combo Khóa học (`/combos`)

- Truy cập trang **Combo (`/combos`)** để lựa chọn các gói combo gồm nhiều khóa học kết hợp với mức giá ưu đãi đặc biệt.
- Quy trình thanh toán, áp dụng coupon và nộp minh chứng của combo hoàn toàn tương tự như khóa học đơn lẻ.
