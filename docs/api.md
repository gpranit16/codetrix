# MiniLedger API Documentation

Base URL: `http://localhost:4000` (or `http://10.0.2.2:4000` on Android emulator)

All protected endpoints require the HTTP Header:
`Authorization: Bearer <jwt_token>`

---

## 1. Health Check

### `GET /api/health`
Checks backend and database health.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "MiniLedger Backend API",
  "timestamp": "2026-10-21T14:40:10.513Z",
  "database": "connected",
  "uptime": 124.5
}
```

---

## 2. Authentication

### `POST /api/auth/send-otp`
Requests a 6-digit mock OTP for login or registration. The OTP is printed to the backend console.

**Request Body**:
```json
{
  "phoneNumber": "+919876543210"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "OTP generated and sent successfully (check server console log)",
  "cooldownSeconds": 30
}
```

**Console Output**:
```text
============================================================
🔑 [MINILEDGER MOCK OTP VERIFICATION]
📱 Phone Number : +919876543210
🔢 One-Time Code: 996948
⏳ Valid For    : 10 minutes
============================================================
```

### `POST /api/auth/verify-otp`
Verifies the submitted OTP, marks it single-use, and issues a JWT token.

**Request Body**:
```json
{
  "phoneNumber": "+919876543210",
  "otp": "996948"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Successfully authenticated",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "fa430ae0-cbf3-4b7d-8b10-831c5bee9d11",
    "phoneNumber": "+919876543210",
    "createdAt": "2026-10-21T14:26:00.000Z"
  }
}
```

### `GET /api/auth/me` *(Protected)*
Returns the current authenticated user's profile.

---

## 3. Financial Summary

### `GET /api/summary` *(Protected)*
Returns aggregate financial totals calculated using exact decimal arithmetic.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalLent": 5500.5,
    "totalRepaid": 1200.0,
    "overdueAmount": 2800.5,
    "activeCount": 2,
    "repaidCount": 1,
    "overdueCount": 1
  }
}
```

---

## 4. Loan Management

### `GET /api/loans` *(Protected)*
Returns all loans belonging to the authenticated user.

**Query Parameters (Optional)**:
- `status`: `ALL` | `PENDING` | `OVERDUE` | `REPAID`
- `search`: Filter by friend name (case-insensitive substring)

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "c1387680-ba88-4672-913a-a169d0d39e80",
      "userId": "fa430ae0-cbf3-4b7d-8b10-831c5bee9d11",
      "friendName": "Priya Patel",
      "amount": 2800.5,
      "dueDate": "2026-10-17T14:26:00.000Z",
      "status": "OVERDUE",
      "isOverdue": true,
      "daysOverdue": 4,
      "repaidAt": null,
      "receiptUrl": null,
      "notes": "Concert ticket advance",
      "createdAt": "2026-10-21T14:26:00.000Z",
      "updatedAt": "2026-10-21T14:26:00.000Z"
    }
  ]
}
```

### `POST /api/loans` *(Protected)*
Creates a new loan entry.

**Request Body**:
```json
{
  "friendName": "Rahul Sharma",
  "amount": 1500.0,
  "dueDate": "2026-10-28T00:00:00.000Z",
  "notes": "Weekend dinner share"
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Loan entry created successfully",
  "data": {
    "id": "e49f2b82-9382-4bf8-b2ef-361093cfa320",
    "friendName": "Rahul Sharma",
    "amount": 1500,
    "dueDate": "2026-10-28T00:00:00.000Z",
    "status": "PENDING",
    "isOverdue": false,
    "daysOverdue": 0
  }
}
```

### `PATCH /api/loans/:id/repay` *(Protected)*
Marks an outstanding loan as fully repaid.

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Loan successfully marked as repaid",
  "data": {
    "id": "c1387680-ba88-4672-913a-a169d0d39e80",
    "status": "REPAID",
    "repaidAt": "2026-10-21T14:45:00.000Z"
  }
}
```

*Note: Attempting to repay an already repaid loan returns `400 Bad Request`.*

### `POST /api/loans/:id/receipt` *(Protected)*
Uploads a receipt image attachment (`multipart/form-data` with field `receipt`).
- Supported types: JPEG, PNG, WEBP.
- Max size: 5MB.
