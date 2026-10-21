# MiniLedger 💳

> A full-stack, mobile-first peer-to-peer debt and credit ledger application engineered with **React Native (Expo)**, **Node.js**, **Express**, **TypeScript**, and **PostgreSQL (Prisma ORM)**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-black.svg)](https://expo.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal.svg)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Tests-19_Passed-brightgreen.svg)](https://vitest.dev/)

---

## 📋 Features

- 📱 **Mobile-First Experience**: Built with React Native & Expo for native iOS and Android compatibility.
- 🔑 **Passwordless Mock OTP Authentication**: Enter phone number, receive a cryptographically generated 6-digit OTP in the server console, single-use verification, 30s resend cooldown, and signed JWT authentication.
- 📊 **Real-time Financial Summary**: Real-time totals for **Total Lent**, **Total Repaid**, and **Overdue Amount** using exact database decimal arithmetic to prevent precision rounding errors.
- ⚠️ **Visual Overdue Highlights**: Automated detection of delayed repayments with days overdue counters and warning banners.
- 📝 **Add Loan Management**: Create loans with friend name, INR amount, due date presets, and optional notes.
- 🤝 **Settlement Flow**: Mark outstanding loans as repaid with a safety confirmation dialog.
- 📸 **Receipt Upload (Bonus)**: Optional receipt photo attachment using Expo ImagePicker and server-side disk storage.
- 🛡️ **Strict Ownership Isolation**: Relational user isolation ensures zero access to other users' loan records.
- 🧪 **Automated Testing Suite**: 19 comprehensive Vitest integration tests covering auth, OTP, validation, repayments, summaries, and edge cases.

---

## 🏗️ Architecture & Project Structure

```text
miniledger/
├── apps/
│   └── mobile/              # React Native Expo Mobile App
│       ├── App.tsx          # Root navigation & AuthProvider
│       ├── index.ts         # Expo entry point
│       ├── app.json         # Expo config
│       └── src/
│           ├── api/         # Typed API client with auto-host detection
│           ├── components/  # SummaryCard, LoanCard, StatusBadge, Modals
│           ├── context/     # AuthContext (state, JWT tokens, session lifecycle)
│           ├── screens/     # LoginScreen, DashboardScreen, AddLoanScreen
│           ├── theme/       # FinTech design tokens (anti-ai-slop palette)
│           ├── types/       # TypeScript interfaces
│           └── utils/       # Storage (SecureStore + AsyncStorage), formatters
├── server/                  # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma    # PostgreSQL Schema (Users, OtpChallenges, Loans)
│   │   └── seed.ts          # Reproducible test fixture seeder
│   └── src/
│       ├── config/          # Environment parsing (Zod) & multer setup
│       ├── controllers/     # Auth, Loan, and Summary controllers
│       ├── middleware/      # requireAuth, errorHandler, validateBody
│       ├── routes/          # REST API endpoints
│       ├── services/        # AuthService, LoanService, SummaryService
│       ├── utils/           # Logger (OTP console banner), crypto OTP, JWT
│       └── __tests__/       # Vitest integration tests (19 test cases)
├── docs/                    # Technical architecture, API reference, screenshots
├── .gitignore
├── .env.example
├── package.json             # Root monorepo workspace scripts
└── README.md
```

---

## ⚡ Prerequisites

Before running the project, ensure you have:
1. **Node.js**: v18+ (tested on Node v22.19.0).
2. **npm**: v9+ (or pnpm / yarn).
3. **PostgreSQL**: 14+ installed and running locally on port `5432` (or via Docker).
4. **Mobile Device or Emulator**:
   - Physical device: Install the free **Expo Go** app from App Store or Google Play.
   - Or an Android Emulator / iOS Simulator.

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/gpranit16/codetrix.git
cd codetrix

# Install root & workspace dependencies
npm install
npm --prefix server install
npm --prefix apps/mobile install
```

### 2. Configure Environment Variables

Create `.env` inside the `server/` directory:

```bash
# server/.env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:123456@localhost:5432/miniledger?schema=public"
JWT_SECRET="miniledger_super_secure_jwt_secret_dev_key_2026_xyz"
JWT_EXPIRES_IN="7d"
OTP_EXPIRY_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=30
MAX_OTP_ATTEMPTS=5
MAX_UPLOAD_SIZE_MB=5
UPLOAD_DIR="./uploads"
```

*(Adjust your PostgreSQL user and password in `DATABASE_URL` if different).*

### 3. Setup PostgreSQL Database

```bash
# Push schema to PostgreSQL database
npm run db:migrate # or npm --prefix server run db:push

# Seed with initial demo loans (1 pending, 1 overdue, 1 repaid)
npm run db:seed
```

### 4. Run Automated Tests

Execute the full backend test suite:

```bash
npm run test:server
```

**Result**: 19 tests passing across health, authentication, mock OTP, loan CRUD, ownership isolation, repayments, and financial calculations.

---

## 🖥️ Running the Application

### 1. Start the Backend API

```bash
npm run dev:server
```
The server will start on `http://localhost:4000`.

- Local Health Check: `http://localhost:4000/api/health`
- LAN Access: `http://192.168.1.103:4000`
- Android Emulator Host: `http://10.0.2.2:4000`

### 2. Start the React Native Mobile App

In a separate terminal window:

```bash
npm run dev:mobile
```

- **Physical Android or iOS Device**: Scan the QR code shown in the terminal using the Expo Go app. Ensure your phone and computer are on the same Wi-Fi network.
- **Android Emulator**: Press `a` in the terminal.
- **Web Preview**: Press `w` in the terminal.

---

## 🔑 Mock OTP Authentication Workflow

1. Open the MiniLedger mobile app.
2. Enter your phone number (e.g., `+919876543210`) and tap **Send One-Time Password**.
3. Inspect your backend server terminal. A highlighted box will appear:
   ```text
   ============================================================
   🔑 [MINILEDGER MOCK OTP VERIFICATION]
   📱 Phone Number : +919876543210
   🔢 One-Time Code: 996948
   ⏳ Valid For    : 10 minutes
   ============================================================
   ```
4. Enter the 6-digit code in the app to authenticate.

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Protected |
|---|---|---|:---:|
| `GET` | `/api/health` | Health status and DB ping | No |
| `POST` | `/api/auth/send-otp` | Generate and print mock OTP | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP and return JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/summary` | Total Lent, Repaid & Overdue summary | Yes |
| `GET` | `/api/loans` | List loans for current user (filter by status/search) | Yes |
| `POST` | `/api/loans` | Create new loan entry | Yes |
| `GET` | `/api/loans/:id` | Get specific loan details | Yes |
| `PATCH` | `/api/loans/:id/repay` | Mark loan as repaid | Yes |
| `POST` | `/api/loans/:id/receipt` | Upload receipt photo attachment | Yes |

*For complete request and response schemas, see [docs/api.md](docs/api.md).*

---

## 🧪 Verified Test Suite

```text
✓ MiniLedger Backend API Integration Tests (19 tests)
  ✓ Health Endpoint > GET /api/health returns healthy & DB connected
  ✓ Authentication & Mock OTP Flow
    ✓ rejects invalid phone numbers
    ✓ generates mock OTP and prints to server console
    ✓ enforces 30s resend cooldown
    ✓ rejects incorrect OTP
    ✓ succeeds with valid OTP and issues JWT
    ✓ rejects reuse of verified OTP (single-use)
    ✓ GET /api/auth/me returns authenticated user profile
    ✓ GET /api/auth/me rejects missing or invalid Bearer token
  ✓ Loan Management & Ownership Security
    ✓ rejects non-positive loan amounts
    ✓ creates valid loan with future due date
    ✓ creates overdue loan with past due date & computes daysOverdue
    ✓ User B cannot see User A loans (Ownership Isolation)
    ✓ User B gets 404 access denied when requesting User A loan
    ✓ User B cannot mark User A loan as repaid
    ✓ GET /api/summary calculates exact financial totals
    ✓ User A marks overdue loan as repaid
    ✓ rejects repeated repayment attempts
    ✓ GET /api/summary updates totalRepaid and resets overdueAmount to ₹0
```

## 📱 App Screenshots

| 1. Phone Login & Mock OTP | 2. Financial Dashboard & Overdue | 3. Add Loan Entry |
|:---:|:---:|:---:|
| <img src="docs/screenshots/01-login-screen.png" width="260" alt="Login Screen" /> | <img src="docs/screenshots/02-dashboard-screen.png" width="260" alt="Dashboard Screen" /> | <img src="docs/screenshots/03-add-loan-modal.png" width="260" alt="Add Loan Screen" /> |

---

## 🎥 Screen Recording & Demo

- 🔗 **Google Drive Demo Video**: [**Watch MiniLedger Walkthrough Video (2–3 Mins)**](https://drive.google.com/file/d/1Z02LXTgqkRr50cc9pBV1AUJi748S8fKg/view?usp=sharing)
- 📁 **Repository Video File**: [`docs/miniledger-demo-walkthrough.webp`](docs/miniledger-demo-walkthrough.webp)

---

## 📄 License

MIT © 2026 MiniLedger Full-Stack Assignment.
