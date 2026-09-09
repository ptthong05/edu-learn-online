# Hướng dẫn Chương trình Tiếp thị liên kết (Affiliate) - Phiên bản v2 (Đã chuẩn hóa)

> **Phiên bản:** 2.0 (Cập nhật sau kiểm thử tĩnh & rà soát tài liệu ORD-671 / ORD-682)  
> **Áp dụng cho:** Hệ thống **EduLearn Online** (Frontend & Backend Production)

---

## 1. Tổng quan về Chương trình Affiliate

Chương trình Affiliate cho phép học viên và đối tác tạo thu nhập bằng cách chia sẻ liên kết giới thiệu các khóa học, combo học tập trên EduLearn đến bạn bè, học viên hoặc cộng đồng.

### Cơ chế ghi nhận & Nhận hoa hồng:
* Mỗi khi khách hàng nhấn vào đường link giới thiệu hợp lệ (`?ref=YOUR_CODE`) và hoàn tất thanh toán đơn hàng (trạng thái `completed` & `da_thanh_toan`), hệ thống sẽ tự động ghi nhận doanh thu và cộng hoa hồng vào ví CTV.
* Áp dụng cho toàn bộ sản phẩm trên hệ thống: **Khóa học đơn lẻ** (`/courses`) và **Combo khóa học tiết kiệm** (`/combos`).
* Tỷ lệ hoa hồng được áp dụng theo quy định của hệ thống (mặc định từ **10% - 30%** tùy chính sách).

---

## 2. Quy trình Đăng ký & Vòng đời Trạng thái Tài khoản

### Các bước tham gia:
1. Đăng nhập vào hệ thống EduLearn.
2. Điều hướng đến mục **Tài khoản cá nhân → Tab Tiếp thị liên kết** (đường dẫn: `/tai-khoan?tab=affiliate` hoặc `/tai-khoan`).
3. Điền đầy đủ thông tin: Họ tên, Email, Số điện thoại, Thông tin ngân hàng (Tên ngân hàng, Số tài khoản, Chi nhánh), Ngày sinh, Địa chỉ.
4. Nhấn nút **Đăng ký làm Cộng tác viên**.

### Vòng đời trạng thái tài khoản Affiliate (Chuẩn Backend/DB):

| Trạng thái (Status) | Tên hiển thị | Ý nghĩa & Quyền hạn |
|:---|:---|:---|
| `pending` | **Chờ duyệt** | Đơn đăng ký đã gửi thành công, đang chờ Ban quản trị (Manager/Staff) đối soát thông tin. |
| `approved` | **Đã kích hoạt** | Đã được phê duyệt chính thức, được cấp mã giới thiệu riêng (tiền tố `CTVxxx`), bắt đầu ghi nhận hoa hồng. |
| `rejected` | **Bị từ chối** | Đơn đăng ký chưa đạt yêu cầu. Học viên có thể cập nhật lại thông tin để gửi yêu cầu xét duyệt lại. |
| `terminated` | **Đã chấm dứt** | Tài khoản CTV bị thu hồi quyền do vi phạm chính sách hoặc dừng hoạt động. |

---

## 3. Cách lấy và chia sẻ Link giới thiệu

Sau khi tài khoản đạt trạng thái `approved`, giao diện Affiliate Dashboard sẽ cung cấp:
* **Mã giới thiệu (Referral Code / CTV Code):** Tự động sinh có định dạng chuẩn (ví dụ `CTV001`, `CTV002`, ...).
* **Đường link giới thiệu đầy đủ:**
  ```text
  http://localhost:3000/?ref=CTV001
  # hoặc https://edulearn.vn/?ref=CTV001
  ```

### Các kênh chia sẻ hiệu quả:
* Mạng xã hội: Facebook, Zalo, TikTok, YouTube, Threads.
* Blog cá nhân, bài viết đánh giá / review khóa học.
* Hội nhóm học tập, câu lạc bộ sinh viên, lập trình viên.

![Giao diện Bảng điều khiển Affiliate](../../images/08-affiliate-user.png)

---

## 4. Quy trình Yêu cầu Rút tiền Hoa hồng (Withdrawals)

### Điều kiện rút tiền hợp lệ:
1. **Số dư khả dụng:** Phải lớn hơn hoặc bằng mức tối thiểu quy định của hệ thống.
2. **Hạn mức rút tối thiểu:** **50.000 VNĐ / lần rút** (Quy định hệ thống kiểm tra chặt chẽ ở cả Frontend và Backend).
3. **Thông tin ngân hàng:** Tài khoản nhận tiền phải là tài khoản ngân hàng chính chủ tại Việt Nam đã khai báo.

### Các bước gửi yêu cầu rút tiền:
1. Tại trang **Tài khoản → Tab Affiliate**, nhấn nút **Yêu cầu rút tiền**.
2. Nhập **Số tiền cần rút** (tối thiểu `50.000đ` và không vượt quá số dư hoa hồng khả dụng).
3. Kiểm tra lại thông tin ngân hàng thụ hưởng (Tên ngân hàng, Số tài khoản, Chủ tài khoản).
4. Nhấn **Gửi yêu cầu rút tiền**.

### Vòng đời trạng thái yêu cầu rút tiền:

| Trạng thái | Tên hiển thị | Ý nghĩa |
|:---|:---|:---|
| `pending` | **Chờ xử lý** | Yêu cầu đã được ghi nhận vào hệ thống (`POST /api/affiliate/withdrawals`) và chờ Admin chuyển khoản. |
| `completed` | **Đã chi trả** | Quản trị viên đã chuyển khoản thành công và bấm Duyệt thanh toán trên hệ thống. |
| `rejected` | **Từ chối** | Yêu cầu bị từ chối (do sai thông tin ngân hàng hoặc nghi vấn gian lận); tiền hoàn lại số dư khả dụng. |

---

## 5. Theo dõi & Báo cáo hiệu suất kinh doanh

Giao diện Dashboard cập nhật các chỉ số báo cáo thời gian thực từ API `GET /api/affiliate/report`:
* **Tổng lượt click:** Tổng số lần đường link giới thiệu được người dùng nhấp vào.
* **Số đơn hàng thành công:** Số lượng đơn hàng đã hoàn tất thanh toán có gắn mã giới thiệu của bạn.
* **Tổng doanh thu:** Tổng giá trị tiền tệ các đơn hàng bạn đã mang lại cho hệ thống.
* **Số dư hoa hồng khả dụng:** Số tiền hoa hồng hiện tại bạn có thể tạo lệnh rút về ngân hàng.
* **Lịch sử thanh toán:** Bảng kê chi tiết từng giao dịch hoa hồng và từng đợt rút tiền.
