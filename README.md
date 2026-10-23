# MiniLedger

A small app to keep track of money you've lent to friends. You log in with your phone number, add who owes you what and when, and the home screen shows how much is outstanding and what's overdue.

- **Backend:** Node.js + TypeScript + Express + PostgreSQL (Prisma)
- **App:** React Native (Expo)

Demo video: _add link here_

## Features

- Phone number login with a mock OTP (the OTP is printed in the server terminal)
- Add a loan: friend's name, amount, due date
- Mark a loan as repaid
- Summary card: outstanding, total lent, total repaid, overdue amount
- Overdue loans are highlighted in red, repaid loans are dimmed with a "Repaid" tag
- Loan detail screen
- **Bonus:** attach a receipt photo (camera or gallery) to a loan
- **Bonus:** input validation with zod on both the server and the app

## Running it locally

### Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io)
- PostgreSQL running locally
- [Expo Go](https://expo.dev/go) on your phone (needs to support Expo SDK 57)
- Phone and laptop on the same Wi-Fi

### 1. Server

```bash
cd server
pnpm install
cp .env.example .env
```

Edit `server/.env`:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/miniledger
JWT_SECRET=any-long-random-string
PORT=4000
```

Create the database and run the migrations:

```bash
createdb miniledger
pnpm db:migrate
pnpm dev
```

The server listens on `http://0.0.0.0:4000`.

### 2. App

```bash
cd app
pnpm install
cp .env.example .env
```

Set your laptop's LAN IP in `app/.env` (on macOS: `ipconfig getifaddr en0`):

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
```

`localhost` won't work here because the app runs on your phone, not on the laptop.

```bash
pnpm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### 3. Logging in

Enter any 10-digit Indian mobile number and tap **Send OTP**. The code shows up in the server terminal:

```
OTP for 9876543210: 482913
```

Enter it in the app. A new account is created automatically the first time a number logs in.

## API

All `/loans` routes need an `Authorization: Bearer <token>` header.

| Method | Route | Body | Description |
|---|---|---|---|
| POST | `/auth/request-otp` | `{ phone }` | Generates an OTP and prints it to the server log |
| POST | `/auth/verify-otp` | `{ phone, otp }` | Returns `{ token }` |
| GET | `/loans` | | List your loans, newest first |
| GET | `/loans/summary` | | `{ totalLent, totalRepaid, overdue }` |
| GET | `/loans/:id` | | One loan |
| POST | `/loans` | multipart: `friendName`, `amount`, `dueDate` (YYYY-MM-DD), optional `receipt` image | Create a loan |
| PATCH | `/loans/:id/repay` | | Mark a loan as repaid |
| GET | `/uploads/:file` | | Receipt images |

Errors always come back as `{ error, details? }`, where `details` holds field-level validation messages.

## Project structure

```
server/
  prisma/schema.prisma     User, Otp, Loan models
  src/
    app.ts                 express setup, routes, error handler
    routes/                URL -> controller mapping
    controller/            request handlers
    schema/                zod schemas for request validation
    middleware/            auth (JWT), validation, receipt upload (multer)
    utils/                 prisma client, OTP generation, summary/overdue logic

app/
  src/app/                 screens (expo-router, file based)
    _layout.tsx            stack navigator + login guard
    login.tsx
    index.tsx              home: summary card + loan list
    loans/new.tsx          add loan form
    loans/[id].tsx         loan detail with receipt
  components/              summary card, loan row, loan form
  lib/                     api client, auth store, formatting helpers
```

## Design decisions

- **Money is stored as `Decimal(12,2)`**, not float, so totals are always exact. The API sends amounts as strings like `"3000.00"`.
- **Overdue is calculated, not stored.** A loan is overdue if it isn't repaid and its due date is before today. A loan due today is not overdue yet. Since it's never saved, it can't go stale.
- **Due dates are date-only** (`@db.Date`) and travel as `YYYY-MM-DD`. Otherwise a date picked in IST could shift to the previous day when converted to UTC.
- **Full repayment only.** The brief says "mark as repaid", so a loan is either owed or repaid. Partial payments could be added later with a `Repayment` table linked to each loan.
- **OTPs are hashed** with bcrypt, expire after 5 minutes, and can only be used once.
- **Receipts are stored on local disk** in `server/uploads/` (images only, max 5 MB). In production these would go to S3 or similar.
- **Users only see their own loans.** Requesting someone else's loan id returns 404.
