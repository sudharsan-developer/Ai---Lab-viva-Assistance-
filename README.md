# 🎓 AI-Powered Viva Preparation & Performance Evaluation System

A full-stack college viva examination platform powered by Google Gemini AI.

---

## ⚡ ONE-COMMAND STARTUP (After PC Restart)

### Option 1 — Double-Click (Easiest) ✅ RECOMMENDED
```
Double-click:  D:\Demo project\viva-system\start-project.bat
```

### Option 2 — PowerShell
```powershell
cd "D:\Demo project\viva-system"
.\start-project.ps1
```

**That is all.** The script will:
- ✅ Check if MongoDB is running (auto-start if not)
- ✅ Detect and free ports 3000 and 5000 if occupied
- ✅ Start Backend in a **Blue** terminal window
- ✅ Start Frontend in a **Purple** terminal window
- ✅ Open http://localhost:3000 in your browser automatically

---

## 🛑 To Stop the System

```
Double-click:  D:\Demo project\viva-system\stop-project.bat
```

Or simply close the Backend and Frontend terminal windows.

---

## 🔑 Login Credentials

### 👨‍🏫 Staff Login → http://localhost:3000/staff/login

| Username | Password | Subject |
|----------|----------|---------|
| `srinivasan` | `staff123` | Advanced Java Programming |
| `revathi` | `staff123` | Artificial Intelligence and Machine Learning |
| `selvi` | `staff123` | Sentiment Analysis |
| `dhanalakshmi` | `staff123` | Big Data Analytics Using R and Hadoop |

### 👩‍🎓 Student Login → http://localhost:3000/student/login

- **Username:** Register number in lowercase (e.g., `25pca04001`)
- **Password:** `student123`
- **All 42 students** are pre-loaded in the database

---

## 🎯 How to Use

### Staff Flow
1. Login as staff → **"Schedule Viva"**
2. Select lab topic, date, time, duration → Click **"Schedule for All 42 Students"**
3. One click assigns the viva to **all students simultaneously**
4. View results → **"Performance Reports"**

### Student Flow
1. Login as student → **"My Schedules"**
2. When the scheduled time arrives, status becomes **Active**
3. Click **"🚀 Start Viva"**
4. Gemini AI generates **20 MCQ questions** for your topic
5. Questions are **read aloud** automatically (Web Speech API)
6. Answer all questions → **Submit**
7. View your score, percentage, and performance analysis

---

## 🏗️ Project Structure

```
D:\Demo project\viva-system\
│
├── start-project.bat       ← 🚀 DOUBLE-CLICK TO START (Windows)
├── start-project.ps1       ← PowerShell version
├── stop-project.bat        ← Click to stop all services
├── README.md               ← This file
│
├── backend/
│   ├── server.js           ← Express API (Port 5000)
│   ├── .env                ← API keys & config
│   ├── seed.js             ← Database seeder (run once)
│   ├── config/db.js        ← MongoDB connection
│   ├── models/             ← Mongoose schemas
│   ├── controllers/        ← Business logic
│   ├── routes/             ← API endpoints
│   └── middleware/auth.js  ← JWT authentication
│
└── frontend/
    └── src/
        ├── App.js          ← Routes & navigation
        ├── pages/          ← All page components
        ├── components/     ← Reusable UI components
        ├── api/axios.js    ← API client
        └── context/        ← Auth state management
```

---

## 🔧 Manual Setup (First Time Only)

If running for the first time after a fresh install:

```powershell
# 1. Install backend dependencies
cd "D:\Demo project\viva-system\backend"
npm install

# 2. Install frontend dependencies
cd "D:\Demo project\viva-system\frontend"
npm install

# 3. Seed the database (only needed once, or after clearing MongoDB)
cd "D:\Demo project\viva-system\backend"
node seed.js
```

After these steps, use `start-project.bat` for all future startups.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18 + Tailwind CSS (CDN) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| AI (MCQ + Chat) | Google Gemini 3.6 Flash |
| Voice | Web Speech API (SpeechSynthesis) |
| Auth | JWT + bcrypt |

---

## ⚠️ Troubleshooting

**"Login failed"** — Run `node seed.js` in the backend folder to reload student/staff data.

**"Port already in use"** — Run `stop-project.bat` first, then `start-project.bat`.

**"AI questions not generating"** — Check internet connection. Gemini API requires internet.

**"Voice not working"** — Use **Google Chrome** for best Web Speech API support.

**MongoDB not starting** — Ensure MongoDB 7.0 is installed at:
`C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`
