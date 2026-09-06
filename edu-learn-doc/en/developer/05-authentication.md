# Authentication, Authorization & Security

This document outlines the Authentication mechanism, Role-Based Access Control (RBAC), Session & Token Storage, and Security Architecture implemented in the **EduLearn Online** system.

---

## 1. Authentication Mechanism

EduLearn uses stateless **JSON Web Tokens (JWT)** with the `HS256` signature algorithm.

### Authentication Flow:
1. User logs in via `POST /api/auth/login` (or `/api/login`) with email and password.
2. Server validates credentials against the database using `bcrypt.compare`.
3. Server generates a signed JWT token valid for **7 days**.
4. Server responds with `{ token, user }`.
5. Client synchronizes and stores the token in **Cookie**, **localStorage**, and **sessionStorage**.
6. Subsequent requests include the header `Authorization: Bearer <token>`.
7. Server middleware `authenticateToken` validates token signatures and role permissions.

---

## 2. JWT Payload Structure

The JWT token contains 6 standard identity fields:

```json
{
  "id": "u-1725184200000",
  "full_name": "Nguyen Van A",
  "email": "user@example.com",
  "role": "USER",
  "must_change_password": 0,
  "status": "active",
  "iat": 1725184200,
  "exp": 1725789000
}
```

* `id`: Unique user ID.
* `full_name`: User's full display name.
* `email`: User login email.
* `role`: User role (`USER`, `AFFILIATE`, `MANAGER`, `STAFF`).
* `must_change_password`: Flag requiring password update on first login (`1`: Yes, `0`: No).
* `status`: Account status (`active` / `blocked`).
* `iat`, `exp`: Issued at and expiration timestamps (**7-day lifetime**).

---

## 3. Client-Side Token Storage Architecture

In `frontend/src/lib/utils/auth.ts`, the client maintains synchronized state across 3 storage mechanisms:

1. **Browser Cookie (`document.cookie`):**
   * Enables **Next.js Middleware (`frontend/src/middleware.ts`)** to read session tokens during Server-Side Rendering (SSR) for seamless route protection and redirection.
   * *Technical Note:* This cookie is created on the JavaScript client side (with `path=/`, `SameSite=Lax`) and is **not an HttpOnly cookie**.
2. **`localStorage`:**
   * Persists `token` and `user` payload across browser tab lifecycles.
3. **`sessionStorage`:**
   * Caches active session state within the current browser tab.

---

## 4. CORS Policy & Public Route Boundaries

### 4.1 CORS Configuration:
The backend server configures:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4.2 Public Endpoints (No Authentication Required):
* **Authentication:**
  * `POST /api/auth/register` (or `POST /api/register`): User registration.
  * `POST /api/auth/login` (or `POST /api/login`): User login.
  * `POST /api/forgot-password`: Request password reset email.
  * `POST /api/reset-password`: Set new password with reset token.
* **Affiliate Tracking:**
  * `POST /api/affiliates/clicks`: Record affiliate referral link clicks.
* **Public Catalog (GET):**
  * `GET /api/courses`, `GET /api/courses/:id`, `GET /api/categories`, `GET /api/combos`, `GET /api/blogs`, `GET /api/site-settings`.

---

## 5. Role-Based Access Control (RBAC)

| Role | Permissions |
|:---|:---|
| `MANAGER` | Full administrative access, user management (`/admin/users`), admin accounts (`/admin/accounts`), site settings. |
| `STAFF` | Management of courses, orders, combos, coupons, blog posts, withdrawals. **Hidden and blocked from user & account management pages**. |
| `AFFILIATE` | Referral code generation, marketing stats (clicks, revenue, commission), withdrawal requests. |
| `USER` | Course browsing, purchasing, order tracking, personal profile management. |

---

## 6. Password Hashing

* User passwords are encrypted using **bcryptjs** with `salt rounds = 10` before persisting into SQLite.
* Plain text passwords are never stored or transmitted in responses.
