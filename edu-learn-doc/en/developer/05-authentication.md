# Authentication & Authorization

## Authentication Mechanism

EduLearn uses **JWT (JSON Web Token)** for user authentication.

### Authentication Flow

```
1. User logs in → POST /api/auth/login
2. Server validates email + password (bcrypt hash comparison)
3. Server creates JWT token with payload: { id, email, role }
4. Server returns the token
5. Client stores token in localStorage
6. All subsequent requests include: Authorization: Bearer <token>
7. Server middleware verifies token and attaches user to request
```

### JWT Payload

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Expiry

- Default: **7 days**
- Configured in `backend/index.js` via `jwt.sign(payload, secret, { expiresIn: "7d" })`

---

## Authorization (Role-Based Access)

### User Roles

| Role | Description |
|------|-------------|
| `admin` | Full administrative access |
| `user` | Standard user |

### Route Protection Middleware

```javascript
// Requires login only
app.get('/api/orders/me', authenticateToken, ...)

// Requires Admin role
app.post('/api/courses', authenticateToken, requireAdmin, ...)
```

### Frontend Route Guard

```typescript
// middleware.ts (Next.js)
// Protects all routes under /admin/*
// Redirects to /login if not authenticated
// Redirects to / if not an admin
```

---

## Password Hashing

Passwords are hashed using **bcryptjs** with salt rounds = 10:

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
```

---

## Security Notes

- Tokens stored in `localStorage` on the client side
- CORS configured to only allow requests from the frontend origin
- All data-modifying APIs require authentication
- Admin routes require the `admin` role
