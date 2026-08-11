<<<<<<< HEAD
# EMERGENCY-SOS-WEBSITE
=======
# 🚨 Emergency SOS Alert System

A full-stack emergency alert system where users can send SOS alerts, get help from nearby helpers, chat, book blood donations, find hospitals/police, and manage emergency payments.

## 🏗 Tech Stack

**Frontend:** React 18, Tailwind CSS, Socket.IO Client, React Router, Axios, Google Maps Embed
**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT Auth, Nodemailer (OTP)
**Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

---

## ✨ Features

- 🔴 **One-tap SOS** — Send emergency alerts to primary helpers
- 🆘 **Ambulance / Fire / Police** — Quick emergency service notifications
- 📍 **Live Location Tracking** — Google Maps embed with your current location
- 💬 **Emergency Chat** — Real-time messaging with helpers (Socket.IO)
- 🩸 **Blood Donation** — Book donations & view recent requests
- 🏥 **Hospitals & Police** — Find nearby emergency services with direct call
- 📢 **Community Billboard** — Share posts, tags, like & filter
- 💳 **Emergency Payment** — bKash/Nagad wallet top-up
- 👤 **User Profiles** — Manage profile, blood group, emergency balance
- 👥 **Primary Helpers** — Add trusted helpers for alerts

---

## 📁 Project Structure

```
emergency-sos/
├── backend/               # Express + MongoDB API
│   ├── src/
│   │   ├── config/        # Database, Socket, Seed data
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, Upload
│   │   ├── models/        # Mongoose schemas
│   │   └── routes/        # API routes
│   │   └── server.js      # Entry point
│   └── .env               # Backend env vars
├── frontend/              # React app
│   ├── public/
│   ├── src/
│   │   ├── components/    # All page components
│   │   ├── context/       # Auth & Socket contexts
│   │   └── utils/         # API & socket helpers
│   ├── .env               # Frontend env vars
│   └── vercel.json        # Vercel routing config
├── TODO.md
└── README.md
```

---

## ✅ Local Setup

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas cluster (or local MongoDB)
- Gmail account (for OTP emails — enable "Less Secure Apps" or use an App Password)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/emergency-sos
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
CLIENT_URL=http://localhost:3000
```

⚠️ **Note:** If email sending fails (SMTP misconfigured), the OTP is logged to the console so you can still verify during development.

Start the backend:
```bash
npm start        # or npm run dev (auto-reload)
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Open **http://localhost:3000** — the app auto-fills demo data (community posts, an active emergency) on first run.

---

## ☁️ Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo (or use Render's Blueprint).
2. On Render, create a **New Web Service**, connect your repo, set the **Root Directory** to `backend`.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add the environment variables (same as `.env`). Set `CLIENT_URL` to your Vercel URL.
6. In **MongoDB Atlas**, add Render's server IP to the IP whitelist (or set to `0.0.0.0/0` for open access).

### Frontend → Vercel

1. Push the `frontend/` folder to a GitHub repo.
2. On Vercel, **Import Project**, use the `frontend/` folder as Root Directory.
3. Framework preset: **Create React App**.
4. Add env var: `REACT_APP_API_URL=https://<your-backend>.onrender.com/api`
5. Deploy! The `vercel.json` handles client-side routing.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `EMAIL_USER` | Gmail address for sending OTPs |
| `EMAIL_PASS` | Gmail App Password (not your normal password) |
| `GOOGLE_MAPS_API_KEY` | Free Google Maps API key |
| `CLIENT_URL` | Frontend URL (for CORS & Socket.IO) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Google Maps API key for the live map |

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| **Registration fails** | Ensure backend is running on port 5000 and MongoDB is connected |
| **No OTP email received** | Check backend console — OTP is logged there during dev if SMTP fails |
| **Live map not showing** | Ensure internet access for Google Maps embed; fallback location is used if GPS denied |
| **Payment/Profile not loading** | This was caused by a missing `User` import in `paymentController.js` — now fixed |
| **SOS "failed to send"** | Emergency creation was crashing on socket errors — now hardened |
| **Community post won't create** | Tag validation mismatch fixed — "Lost Child" now maps to valid enum value |

---

## 🔌 API Endpoints

- `POST /api/auth/register` — Register user
- `POST /api/auth/verify-otp` — Verify email OTP
- `POST /api/auth/login` — Login
- `POST /api/auth/resend-otp` — Resend OTP
- `GET/PUT /api/users/profile` — Get/Update profile
- `POST /api/users/primary-helper` — Add primary helper
- `POST /api/emergency` — Create SOS alert
- `GET /api/emergency/active` — Active emergencies
- `GET /api/chat` — User chats
- `POST /api/blood/book` — Book blood donation
- `GET/POST /api/community` — Community posts
- `GET /api/payment/wallet` — Get wallet balance
- `POST /api/payment/pay` — Add money (mock)

---

## 📄 License

MIT
>>>>>>> 99cf9a19 (module 1 and module 2)
