# MiniLedger Demo Video Walkthrough Script (2–3 Minutes)

This script provides a structured guide for recording the 2–3 minute submission demo.

---

## ⏱️ Video Timeline Breakdown

| Timestamp | Phase | Action / Screen | Talking Point |
|---|---|---|---|
| **0:00 – 0:25** | **Introduction & Architecture** | Codebase + Terminal | "Hi! This is MiniLedger, a full-stack mobile app built with Node.js, Express, PostgreSQL, Prisma, and React Native Expo." |
| **0:25 – 0:50** | **Mock OTP Login** | Phone Input + Server Console | "First, we sign in with phone `+919876543210`. The server generates a cryptographically hashed 6-digit OTP printed directly in our terminal log." |
| **0:50 – 1:25** | **Dashboard & Overdue Alert** | Dashboard Screen | "Here's the dashboard. At the top, our Summary Card displays Total Lent (₹5,500.50), Total Repaid (₹1,200), and Overdue Amount (₹2,800.50). Notice how Priya Patel's loan is visually highlighted in red as Overdue by 4 days." |
| **1:25 – 1:55** | **Creating a New Loan** | Add Loan Screen | "Let's tap 'Add Loan' to lend ₹2,000 to Rohan with a due date in 1 week. We can also optionally attach a photo receipt. When submitted, Total Lent updates in real-time." |
| **1:55 – 2:30** | **Marking Loan as Repaid** | Repayment Modal + Summary | "Now let's settle Priya's overdue loan. We tap 'Mark as Repaid', review the confirmation dialog, and confirm. Watch how Total Repaid increases, and Overdue Amount drops to ₹0 immediately." |
| **2:30 – 2:50** | **Filter Tabs & Security** | Filter Tabs (All/Pending/Overdue/Repaid) | "We can filter between All, Pending, Overdue, and Repaid loans. All endpoints enforce strict user ownership in PostgreSQL." |
| **2:50 – 3:00** | **Conclusion** | Terminal / Passing Tests | "All 19 Vitest integration tests are passing with full decimal financial precision. Thank you!" |

---

## 🎬 Step-by-Step Recording Checklist

1. **Pre-flight Check**:
   - Ensure PostgreSQL is running on `localhost:5432`.
   - Seed the database: `npm --prefix server run db:seed`.
   - Start the backend: `npm --prefix server run dev`.
   - Start the Expo app: `npm --prefix apps/mobile start`.
2. **Recording Setup**:
   - Open Loom or screen recorder.
   - Position the mobile screen (Expo Go or Web preview) alongside the backend terminal window so the reviewer can see the mock OTP output.
3. **Run the Flow**:
   - Enter `9876543210` -> Click "Send One-Time Password".
   - Highlight the OTP printed in the terminal box:
     ```text
     ============================================================
     🔑 [MINILEDGER MOCK OTP VERIFICATION]
     📱 Phone Number : +919876543210
     🔢 One-Time Code: <6-digits>
     ============================================================
     ```
   - Enter the 6 digits -> Lands on Dashboard.
   - Point out:
     - Total Lent, Total Repaid, and Overdue figures.
     - The red overdue banner on Priya Patel's loan.
   - Tap `+ Add Loan` -> Create a loan for "Rohan" (₹2000).
   - Tap "Mark as Repaid" on Priya Patel's overdue loan.
   - Observe the Overdue card dropping to ₹0 and Total Repaid increasing.
4. **Upload**:
   - Save the recording or copy the Loom / Google Drive link.
   - Paste into the submission notes.
