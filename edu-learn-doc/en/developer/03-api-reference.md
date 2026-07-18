# API Reference

## General Information

- **Base URL**: `http://localhost:5000`
- **Format**: JSON
- **Authentication**: Bearer Token (JWT)

## Required Headers

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

---

## Authentication

### Register

```
POST /api/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

### Login

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "name": "John Doe", "role": "user" }
}
```

---

## Courses

### Get All Courses

```
GET /api/courses
```

**Query Params:**
| Param | Description |
|-------|-------------|
| `category_id` | Filter by category |
| `search` | Search by name |
| `page` | Page number (default: 1) |
| `limit` | Records per page (default: 12) |

### Get Course Detail

```
GET /api/courses/:id
```

### Create Course (Admin)

```
POST /api/courses
Authorization: Bearer <admin_token>
```

### Update Course (Admin)

```
PUT /api/courses/:id
Authorization: Bearer <admin_token>
```

### Delete Course (Admin)

```
DELETE /api/courses/:id
Authorization: Bearer <admin_token>
```

---

## Orders

### Create Order

```
POST /api/orders
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [{"course_id": 1}],
  "coupon_code": "SAVE20",
  "payment_method_id": 1
}
```

### Update Order Status (Admin)

```
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
```

**Body:**
```json
{ "status": "completed" }
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Invalid request data |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `500` | Internal server error |
