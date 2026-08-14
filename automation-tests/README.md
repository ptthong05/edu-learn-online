# Hướng Dẫn Chạy Automation Test (CodeceptJS + Playwright)

Thư mục này chứa mã nguồn kiểm thử tự động (Automation Test) cho dự án **EduLearn**.

---

## 1. Yêu cầu trước khi test

Ứng dụng web cần đang chạy ở cổng mặc định:

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`

---

## 2. Cài đặt môi trường (Chỉ cần chạy lần đầu)

Mở terminal tại thư mục `automation-tests` và chạy:

```bash
cd automation-tests
npm install
npx playwright install chromium
```

---

## 3. Cách thêm test mới

- Tạo 1 folder tương ứng với backlog Jira
  - Ví dụ: `ORD-52_dangKydangNhap`
- Tạo file mới trong thư mục `tests/ORD-52_dangKydangNhap` với đuôi `_test.js`
- Mẫu test cơ bản:

```javascript
Feature("Đăng nhập");

Scenario("Kiểm tra giao diện đăng nhập", ({ I }) => {
  I.amOnPage("/login");
  I.see("Đăng nhập tài khoản");
  I.fillField('input[type="email"]', "test@example.com");
  I.fillField('input[type="password"]', "123456");
  I.click("Đăng nhập");
});
```

---

## 4. Lệnh chạy test

| Thao tác                       | Lệnh chạy (Terminal)                              |
| ------------------------------ | ------------------------------------------------- |
| Chạy test (hiển thị từng bước) | `npm run codeceptjs`                              |
| Chạy test nhanh                | `npm test`                                        |
| Chạy chế độ ngầm (headless)    | `npm run codeceptjs:headless`                     |
| Chạy riêng 1 file chỉ định     | `npx codeceptjs run tests/sample_test.js --steps` |

---

## 5. Bật/Tắt giao diện trình duyệt khi test

Mở file [codecept.conf.js](./codecept.conf.js):

- Hiện trình duyệt: `show: true`
- Chạy ngầm (mặc định): `show: false`
