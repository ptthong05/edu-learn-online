# Quy Chuẩn Lập Trình & Viết Code (Coding Standards)

> **Dự án:** EduLearn Online Platform  
> **Thư mục:** `edu-learn-doc/engineering/`  

---

## 1. Quy chuẩn Backend (Node.js & Express)

- **Đặt tên File & Thư mục:** Sử dụng `camelCase` hoặc `kebab-case` rõ nghĩa (VD: `emailService.js`, `db.js`, `check_uploads.js`).
- **Xử lý Bất đồng bộ:** Luôn ưu tiên dùng `async/await` kết hợp với khối `try...catch` để quản lý ngoại lệ API.
- **Xử lý CSDL:**
  - Sử dụng Truy vấn Tham số hóa (Parameterized Queries) của `sqlite` để chống SQL Injection:
    ```javascript
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    ```
- **Phản hồi API:** Phản hồi luôn có cấu trúc JSON đồng nhất:
  ```json
  {
    "success": true,
    "message": "Thông báo ngắn gọn",
    "data": {}
  }
  ```

---

## 2. Quy chuẩn Frontend (React & Next.js 14)

- **Đặt tên Component:** Sử dụng `PascalCase` cho các file Component React (VD: `CourseCard.tsx`, `Header.tsx`).
- **Formatting:** Định dạng Indent 2 spaces, dấu chấm phẩy `;` rõ ràng.
- **Tailwind CSS:** Gom nhóm className theo logic Layout (Flex/Grid) $\rightarrow$ Spacing (p, m) $\rightarrow$ Colors/Typography.
- **TypeScript:** Định nghĩa rõ `interface` / `type` trong thư mục `src/types/` thay vì dùng `any`.
