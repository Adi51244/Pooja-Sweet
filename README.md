# Pooja Sweets — Staff Tracker

Mobile-first admin app for **Pooja Sweets** to track daily snack money, staff salary, and advance payments.

## Features

- **Admin login** — PIN-protected (only you can access)
- **Snacks tab** — Daily snack money tracking (separate from salary)
- **Salary tab** — Monthly salary, advances, and net pay
- **WhatsApp reminder** — Send yourself a list of pending snack payments
- **Staff tab** — Manage team with snack amount + monthly salary
- **History tab** — Past snack payment records

> Daily snacks are **never** deducted from monthly salary. They are tracked separately.

## Default Login

- **PIN:** `1234` (change immediately in Settings ⚙️)

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** on your phone or browser.

## Daily Use

1. **Staff** — Add each person with daily snack amount and monthly salary
2. **Snacks** — Tap staff when you give snack money; use **Remind** for WhatsApp alert
3. **Salary** — Record advances when staff ask; mark salary paid at month end
4. **Settings** — Add your WhatsApp number for reminders, change PIN

## Environment (optional)

```bash
ADMIN_PIN=5678          # Custom default PIN on first run
JWT_SECRET=your-secret  # Production token secret
PORT=3001
```
