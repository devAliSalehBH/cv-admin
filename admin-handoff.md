# Admin Dashboard — Frontend Handoff

Integration guide for the **web dashboard** (admin) team covering all Admin API routes.

> **Status: Implemented in backend — verify against deployed API before integrating.**

API version `v1`. Base prefix: `/api/v1/admins`

---

## 1. Overview

The Admin API is divided into four sections:

- **Auth** — Login, forget password, reset password, logout.
- **Manage Admins** — Full CRUD for admin accounts.
- **Manage Users** — Full CRUD for end-user accounts.
- **Manage Coupons** — Full CRUD for discount coupons, plus activate/deactivate toggles.

All protected endpoints require a **Sanctum Bearer token** obtained from the Login endpoint.

---

## 2. Conventions

| Convention | Detail |
|---|---|
| **Base URL** | `/api/v1/admins` |
| **Auth** | `Authorization: Bearer {sanctum_admin_token}` |
| **Content-Type** | `application/json` |
| **ID format** | ULID strings (e.g. `01J4Z6A8K8CN2MTA5MTW1S5QZ`) |
| **Pagination** | Laravel default paginator — append `?page=N&per_page=N` to list endpoints |

**Response envelope — Success:**
```json
{
  "success": true,
  "message": "...",
  "data": {},
  "code": 200
}
```

**Response envelope — Validation Error (422):**
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "data": {
    "field_name": ["Error message."]
  },
  "code": 422
}
```

**Response envelope — Not Found (404):**
```json
{
  "success": false,
  "message": "Not Found.",
  "data": null,
  "code": 404
}
```

**Paginated list `data` structure:**
```json
{
  "data": [ "...items..." ],
  "links": {
    "first": "https://...",
    "last": "https://...",
    "prev": null,
    "next": "https://..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 73
  }
}
```

---

## 3. Auth Endpoints

### 3.1 Login

Authenticates an admin and returns a Sanctum Bearer token.

```http
POST /api/v1/admins/auth/login
Accept: application/json
```

**Request Payload:**
```json
{
  "email": "admin@example.com",
  "password": "YourPassword1!"
}
```

> **Note:** `email` is automatically lowercased before validation.

**Validation Rules:**
| Field | Rules |
|---|---|
| `email` | required |
| `password` | required |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
    "full_name": "Super Admin",
    "email": "admin@example.com",
    "is_active": true,
    "is_super_admin": true,
    "token": "1|abc123def456..."
  },
  "code": 200
}
```

---

### 3.2 Logout

Revokes the current admin's active Sanctum token. Requires authentication.

```http
POST /api/v1/admins/auth/logout
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null,
  "code": 200
}
```

> **Auth:** This route is behind `auth:admin` middleware.

---

### 3.3 Forget Password

Initiates the password reset flow. Sends a reset link to the provided email address.

```http
POST /api/v1/admins/auth/forget-password
Accept: application/json
```

**Request Payload:**
```json
{
  "email": "admin@example.com"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `email` | required, valid email (strict), must exist in `admins` table |

> **Note:** `email` is trimmed and lowercased before validation.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reset link sent successfully.",
  "data": null,
  "code": 200
}
```

---

### 3.4 Reset Password

Completes the password reset flow. Sets a new password and revokes all active sessions for the admin.

```http
POST /api/v1/admins/auth/reset-password
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

> **Auth:** This route is behind `auth:admin` + `ability:reset-password` middleware.

**Request Payload:**
```json
{
  "password": "NewSecurePassword1!",
  "password_confirmation": "NewSecurePassword1!"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `password` | required, min 8 chars, max 32 chars, mixed case, numbers, symbols, confirmed |
| `password_confirmation` | required, must match `password` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": null,
  "code": 200
}
```

---

## 4. Manage Admins Endpoints

All routes under this section require `Authorization: Bearer {sanctum_admin_token}`.

Base prefix: `/api/v1/admins/manage-admins`

---

### 4.1 List Admins

```http
GET /api/v1/admins/manage-admins
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Query Parameters:**
| Param | Type | Rules | Description |
|---|---|---|---|
| `page` | integer | optional, min: 1 | Page number |
| `per_page` | integer | optional, min: 1, max: 100 | Items per page |
| `search` | string | optional, max: 255 | Search by name or email |

**Response (200 OK) — paginated:**
```json
{
  "success": true,
  "message": "Data retrieved successfully.",
  "data": {
    "data": [
      {
        "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "is_super_admin": false,
        "created_at": "2026-08-07 12:00:00"
      }
    ],
    "links": {},
    "meta": {}
  },
  "code": 200
}
```

> **Note:** The list uses a slim shape — `id`, `name` (full_name), `email`, `is_super_admin`, `created_at`.

---

### 4.2 Create Admin

```http
POST /api/v1/admins/manage-admins
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Request Payload:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "password": "StrongPass1!",
  "password_confirmation": "StrongPass1!",
  "is_active": true
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `first_name` | required, string, max: 255 |
| `last_name` | required, string, max: 255 |
| `email` | required, valid email, unique in `admins` table, max: 255 |
| `password` | required, confirmed, min 8 chars, mixed case, numbers, symbols |
| `is_active` | optional, boolean |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data created successfully.",
  "data": {
    "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
    "first_name": "Jane",
    "last_name": "Doe",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "is_active": true,
    "is_super_admin": false,
    "created_at": "2026-08-07 12:00:00"
  },
  "code": 200
}
```

---

### 4.3 Show Admin

```http
GET /api/v1/admins/manage-admins/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Path Parameter:**
| Param | Type | Description |
|---|---|---|
| `id` | ULID string | The admin's unique ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully.",
  "data": {
    "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
    "first_name": "Jane",
    "last_name": "Doe",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "is_active": true,
    "is_super_admin": false,
    "created_at": "2026-08-07 12:00:00"
  },
  "code": 200
}
```

---

### 4.4 Update Admin

```http
PATCH /api/v1/admins/manage-admins/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

All fields are optional — only send what you want to change.

**Request Payload:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "password": "NewPass1!",
  "password_confirmation": "NewPass1!",
  "is_active": false
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `first_name` | optional, string, max: 255 |
| `last_name` | optional, string, max: 255 |
| `email` | optional, valid email, unique in `admins` (excluding current), max: 255 |
| `password` | optional, confirmed, min 8 chars, mixed case, numbers, symbols |
| `is_active` | optional, boolean |

**Response (200 OK):** Same shape as [Show Admin](#43-show-admin).

---

### 4.5 Delete Admin

```http
DELETE /api/v1/admins/manage-admins/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data deleted successfully.",
  "data": null,
  "code": 200
}
```

---

## 5. Manage Users Endpoints

All routes under this section require `Authorization: Bearer {sanctum_admin_token}`.

Base prefix: `/api/v1/admins/manage-users`

---

### 5.1 List Users

```http
GET /api/v1/admins/manage-users
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Query Parameters:**
| Param | Type | Rules | Description |
|---|---|---|---|
| `page` | integer | optional, min: 1 | Page number |
| `per_page` | integer | optional, min: 1 | Items per page |
| `search` | string | optional, max: 255 | Search by name or email |

**Response (200 OK) — paginated:**
```json
{
  "success": true,
  "message": "Data retrieved successfully.",
  "data": {
    "data": [
      {
        "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
        "name": "Mohammed Ali",
        "email": "user@example.com",
        "status": "active",
        "created_at": "2026-08-07 12:00:00"
      }
    ],
    "links": {},
    "meta": {}
  },
  "code": 200
}
```

> **Note:** The list uses a slim shape — `id`, `name` (full_name), `email`, `status`, `created_at`.

---

### 5.2 Create User

```http
POST /api/v1/admins/manage-users
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Request Payload:**
```json
{
  "first_name": "Mohammed",
  "last_name": "Ali",
  "email": "user@example.com",
  "phone": "500000000",
  "phone_country": "SA",
  "password": "UserPass1!",
  "password_confirmation": "UserPass1!"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `first_name` | required, string, max: 255 |
| `last_name` | required, string, max: 255 |
| `email` | required, valid email, unique in `users` table, max: 255 |
| `phone` | required, string, max: 20 |
| `phone_country` | required, string, max: 10 (e.g. `SA`) |
| `password` | required, confirmed, min 8 chars, mixed case, numbers, symbols |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data created successfully.",
  "data": {
    "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
    "first_name": "Mohammed",
    "last_name": "Ali",
    "full_name": "Mohammed Ali",
    "email": "user@example.com",
    "phone": "500000000",
    "phone_code": "+966",
    "status": "active",
    "created_at": "2026-08-07 12:00:00"
  },
  "code": 200
}
```

---

### 5.3 Show User

```http
GET /api/v1/admins/manage-users/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully.",
  "data": {
    "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
    "first_name": "Mohammed",
    "last_name": "Ali",
    "full_name": "Mohammed Ali",
    "email": "user@example.com",
    "phone": "500000000",
    "phone_code": "+966",
    "status": "active",
    "created_at": "2026-08-07 12:00:00"
  },
  "code": 200
}
```

---

### 5.4 Update User

```http
PATCH /api/v1/admins/manage-users/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

All fields are optional — only send what you want to change.

**Request Payload:**
```json
{
  "first_name": "Mohammed",
  "last_name": "Ahmed",
  "email": "new-email@example.com",
  "phone": "511111111",
  "phone_code": "+966"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `first_name` | optional, string, max: 255 |
| `last_name` | optional, string, max: 255 |
| `email` | optional, valid email, unique in `users` (excluding current), max: 255 |
| `phone` | optional, string, max: 20 |
| `phone_code` | optional, string, max: 10 |

**Response (200 OK):** Same shape as [Show User](#53-show-user).

---

### 5.5 Delete User

```http
DELETE /api/v1/admins/manage-users/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data deleted successfully.",
  "data": null,
  "code": 200
}
```

---

## 6. Manage Coupons Endpoints

All routes under this section require `Authorization: Bearer {sanctum_admin_token}`.

Base prefix: `/api/v1/admins/manage-coupons`

---

### 6.1 List Coupons

```http
GET /api/v1/admins/manage-coupons
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Query Parameters:**
| Param | Type | Rules | Description |
|---|---|---|---|
| `page` | integer | optional, min: 1 | Page number |
| `per_page` | integer | optional, min: 1 | Items per page |
| `search` | string | optional, max: 255 | Search by coupon code |

**Response (200 OK) — paginated:**
```json
{
  "success": true,
  "message": "Data retrieved successfully.",
  "data": {
    "data": [
      {
        "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
        "code": "SUMMER20",
        "type": "20%",
        "expiry_date": "Aug 31, 2026",
        "usage_limit": "5/50",
        "status": "active"
      }
    ],
    "links": {},
    "meta": {}
  },
  "code": 200
}
```

> **Note (`type` in list):** Pre-formatted as a human-readable string:
> - `percentage` → `"20%"`
> - `amount` → `"20 SAR"`
>
> **Note (`usage_limit`):** Formatted as `"used_count/limit"` (e.g. `"5/50"`). Returns `"N/A"` when no limit is set.
>
> **Note (`expiry_date`):** Formatted as `"Mon DD, YYYY"` (e.g. `"Aug 31, 2026"`). Returns `"N/A"` when no expiry is set.
>
> **Note (`status`):** One of `active`, `inactive`, or `ended`. A coupon becomes `ended` when its `expiry_date` is past or `usage_limit` is reached.

---

### 6.2 Create Coupon

```http
POST /api/v1/admins/manage-coupons
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Request Payload:**
```json
{
  "code": "SUMMER20",
  "type": "percentage",
  "value": 20,
  "expiry_date": "2026-08-31",
  "usage_limit": 50,
  "is_active": true
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `code` | required, string, unique in `coupons` table, max: 255 |
| `type` | required, one of: `amount` or `percentage` |
| `value` | required, numeric, min: 0 |
| `expiry_date` | optional, format: `Y-m-d`, must be today or future |
| `usage_limit` | optional, integer, min: 1 |
| `is_active` | optional, boolean |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data created successfully.",
  "data": {
    "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
    "code": "SUMMER20",
    "type": "percentage",
    "value": 20.0,
    "expiry_date": "2026-08-31 00:00:00",
    "usage_limit": 50,
    "used_count": 0,
    "is_active": true,
    "status": "active",
    "created_at": "2026-08-07 12:00:00"
  },
  "code": 200
}
```

> **Note:** The detail/show resource returns the raw `type` string (`"amount"` or `"percentage"`), raw `value` (float), and `used_count` as separate fields — not pre-formatted like the list.

---

### 6.3 Show Coupon

```http
GET /api/v1/admins/manage-coupons/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully.",
  "data": {
    "id": "01J4Z6A8K8CN2MTA5MTW1S5QZ",
    "code": "SUMMER20",
    "type": "percentage",
    "value": 20.0,
    "expiry_date": "2026-08-31 00:00:00",
    "usage_limit": 50,
    "used_count": 5,
    "is_active": true,
    "status": "active",
    "created_at": "2026-08-07 12:00:00"
  },
  "code": 200
}
```

---

### 6.4 Update Coupon

```http
PATCH /api/v1/admins/manage-coupons/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

> **Note:** `code`, `type`, and `value` are required on update. Send the full coupon payload.

**Request Payload:**
```json
{
  "code": "SUMMER25",
  "type": "percentage",
  "value": 25,
  "expiry_date": "2026-09-30",
  "usage_limit": 100,
  "is_active": true
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `code` | required, string, unique in `coupons` (excluding current), max: 255 |
| `type` | required, one of: `amount` or `percentage` |
| `value` | required, numeric, min: 0 |
| `expiry_date` | optional, format: `Y-m-d`, must be today or future |
| `usage_limit` | optional, integer, min: 1 |
| `is_active` | optional, boolean |

**Response (200 OK):** Same shape as [Show Coupon](#63-show-coupon).

---

### 6.5 Activate Coupon

Sets `is_active = true` on the coupon.

```http
PATCH /api/v1/admins/manage-coupons/{id}/activate
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Coupon activated successfully.",
  "data": null,
  "code": 200
}
```

---

### 6.6 Deactivate Coupon

Sets `is_active = false` on the coupon.

```http
PATCH /api/v1/admins/manage-coupons/{id}/deactivate
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Coupon deactivated successfully.",
  "data": null,
  "code": 200
}
```

---

### 6.7 Delete Coupon

```http
DELETE /api/v1/admins/manage-coupons/{id}
Authorization: Bearer {sanctum_admin_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data deleted successfully.",
  "data": null,
  "code": 200
}
```

---

## 7. Quick Reference Table

| # | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| 3.1 | `POST` | `/api/v1/admins/auth/login` | No | Admin login |
| 3.2 | `POST` | `/api/v1/admins/auth/logout` | Yes | Admin logout |
| 3.3 | `POST` | `/api/v1/admins/auth/forget-password` | No | Initiate password reset |
| 3.4 | `POST` | `/api/v1/admins/auth/reset-password` | Yes + `ability:reset-password` | Set new password |
| 4.1 | `GET` | `/api/v1/admins/manage-admins` | Yes | List admins (paginated) |
| 4.2 | `POST` | `/api/v1/admins/manage-admins` | Yes | Create admin |
| 4.3 | `GET` | `/api/v1/admins/manage-admins/{id}` | Yes | Show admin |
| 4.4 | `PATCH` | `/api/v1/admins/manage-admins/{id}` | Yes | Update admin |
| 4.5 | `DELETE` | `/api/v1/admins/manage-admins/{id}` | Yes | Delete admin |
| 5.1 | `GET` | `/api/v1/admins/manage-users` | Yes | List users (paginated) |
| 5.2 | `POST` | `/api/v1/admins/manage-users` | Yes | Create user |
| 5.3 | `GET` | `/api/v1/admins/manage-users/{id}` | Yes | Show user |
| 5.4 | `PATCH` | `/api/v1/admins/manage-users/{id}` | Yes | Update user |
| 5.5 | `DELETE` | `/api/v1/admins/manage-users/{id}` | Yes | Delete user |
| 6.1 | `GET` | `/api/v1/admins/manage-coupons` | Yes | List coupons (paginated) |
| 6.2 | `POST` | `/api/v1/admins/manage-coupons` | Yes | Create coupon |
| 6.3 | `GET` | `/api/v1/admins/manage-coupons/{id}` | Yes | Show coupon |
| 6.4 | `PATCH` | `/api/v1/admins/manage-coupons/{id}` | Yes | Update coupon |
| 6.5 | `PATCH` | `/api/v1/admins/manage-coupons/{id}/activate` | Yes | Activate coupon |
| 6.6 | `PATCH` | `/api/v1/admins/manage-coupons/{id}/deactivate` | Yes | Deactivate coupon |
| 6.7 | `DELETE` | `/api/v1/admins/manage-coupons/{id}` | Yes | Delete coupon |
