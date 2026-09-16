# ⚡ Interview AI — AI-Powered Career Intelligence & Interview Prep Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68a063?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-v4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-GenAI-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-PDF-00D8A2?style=flat-square&logo=puppeteer&logoColor=white)](https://pptr.dev/)

**Interview AI** is a full-stack, end-to-end career intelligence platform that helps candidates ace technical and behavioral interviews. It combines Google Gemini generative AI with real-time speech recognition, STAR evaluation, a fully dynamic ATS resume studio with PDF preview, and a live mock interview simulator — all wrapped in a clean, minimal UI with full dark/light mode support.

---

## 📋 Table of Contents

- [Key Capabilities](#-key-capabilities)
- [System Architecture](#-system-architecture)
- [Repository Layout](#-repository-layout)
- [Prerequisites & System Requirements](#-prerequisites--system-requirements)
- [Quick Start Guide](#-quick-start-guide)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [Verification & Quality Assurance](#-verification--quality-assurance)
- [Production Deployment](#-production-deployment)
- [Security](#-security)
- [License](#-license)

---

## 🌟 Key Capabilities

### 1. Career Intelligence & Prep Plan Engine
- **Multi-Modal Input**: Upload a resume PDF, paste a self-description, or both — analyzed against the target job description.
- **Deep Gap Analysis**: Quantifies skill gaps with `Low`, `Medium`, `High` severity ratings and remediation guidance.
- **Question Matrix**: Generates role-specific technical and behavioral questions with model answers, interviewer intentions, and key concepts.
- **Adaptive Roadmap**: Day-by-day customized preparation plan with interactive task completion check-offs.
- **Match Score Ring**: Circular visual indicator measuring overall profile-to-role alignment (0–100).

### 2. "Practice Your Answer" & STAR Evaluation
- **Collapsible Per-Question Drawers**: Every question card expands into a dedicated practice zone.
- **Voice Dictation (STT)**: Hands-free verbal responses powered by the Web Speech API with animated recording indicators.
- **STAR Methodology AI Diagnostics**: Structured critique analyzing Situation, Task, Action, and Result framing.
- **0–10 Score with Exemplar**: Quantitative evaluation with actionable feedback and a top-tier sample answer.

### 3. Resume Studio (Full-Screen Workspace)
- **Full-Screen Takeover**: Opens as a dedicated full-screen workspace rather than a cramped popup modal.
- **Dark/Light Mode Toggle**: Theme switcher is accessible directly from inside the Resume Studio header.
- **3 Designer PDF Templates**: Classic (serif), Modern (blue sans-serif), and Minimal (Swiss typographic).
- **Live PDF Preview Tab**: Generates and embeds a real PDF inside an `<iframe>` — you see the exact downloadable document before committing.
- **Dynamic Content Editor**: A fully interactive form builder — not just static text boxes:
  - **Personal Info**: Edit name, email, phone, location, LinkedIn, and website.
  - **Professional Summary**: Free-form textarea.
  - **Experience**: Add/delete roles; add/delete individual bullet points per role.
  - **Projects**: Add/delete projects; each project supports an optional description + unlimited bullet points.
  - **Education**: Add/delete degrees with institution, dates, and detail fields.
  - **Skills**: Add/delete skill categories; category names are editable inline; comma-separated items.
  - **Custom Sections**: Create completely arbitrary sections with a custom heading and as many bullet points as needed — rendered faithfully into all three PDF templates.
- **ATS Keyword Audit Tab**: Visualizes matched and missing keywords from the target job description with an overall ATS score.
- **Save & Download**: Save edits back to MongoDB; download the current template as a polished PDF.
- **Conditional Rendering**: Empty sections (deleted or cleared) are completely omitted from the PDF — no blank headings or ghost spacing.

### 4. Interactive AI Mock Interviewer
- **Hiring Panel Simulation**: Turn-by-turn conversational roleplay simulating a senior technical interviewer.
- **Text-to-Speech (TTS)**: Web Speech Synthesis reads questions aloud in real time.
- **Per-Turn Coaching**: Instant feedback and score after each answer.
- **Executive Scorecard**: End-of-interview assessment with Overall Score, Technical Competence, and Communication ratings.

### 5. Dashboard & Report Management
- **Previous Interviews Page**: Dedicated `/interviews` route listing all past interview reports as cards.
- **Full CRUD Lifecycle**: Rename and delete interview plans directly from the dashboard.
- **Instant SPA Navigation**: Zero-lag client-side routing via React Router.

### 6. UI Design System
- **Tailwind CSS v4**: Custom design tokens via `@theme` in `index.css` mapping native CSS variables.
- **Light & Dark Mode**: Fully dynamic theme switching via `ThemeContext`, persisted to `localStorage` and respects `prefers-color-scheme`.
- **Soft Zinc Palette**: `#fafafa` light canvas, `#0e0e0f` dark canvas — no harsh pure white or pitch black.
- **Layered Shadow System**: Five elevation levels with crisp multi-layer drop shadows that work correctly in both themes.
- **Geist Font**: `Geist Sans` for UI text; `Geist Mono` for metrics and code tokens.
- **Framer Motion**: Smooth entrance animations and layout transitions throughout.

---

## 🏗️ System Architecture

```
Browser (React SPA)
        │
        │  HTTPS / HTTP
        ▼
Express.js API Server (Node.js)
        │
        ├── JWT Auth (HTTP-only cookie)
        ├── Multer (PDF upload / memory storage)
        ├── Google Gemini API (text generation, JSON schema)
        ├── Puppeteer (headless Chrome → PDF buffer)
        │
        └── MongoDB Atlas / Local
              ├── users
              ├── interviewReports  (resume, gaps, questions, tailoredResumeData)
              ├── tokenBlacklists   (TTL 3 days)
              └── mockInterviewSessions
```

---

## 🗂️ Repository Layout

```
interview-ai-project/
│
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── src/
│   │   ├── app.js                   # Middleware, CORS, routes mounting
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── interview.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── interviewReport.model.js
│   │   │   ├── tokenBlacklist.model.js
│   │   │   └── mockInterviewSession.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── interview.routes.js
│   │   ├── services/
│   │   │   └── ai.service.js        # Gemini calls, Puppeteer PDF, HTML templates
│   │   └── middleware/
│   │       └── auth.middleware.js
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── index.css                # Tailwind v4 @theme tokens + :root / .dark variables
│   │   ├── App.jsx                  # Routes, ThemeProvider, ToastProvider
│   │   ├── context/
│   │   │   ├── theme.context.jsx    # Dark/light mode state + localStorage persistence
│   │   │   ├── toast.context.jsx    # Global toast notification system
│   │   │   └── auth.context.jsx     # User session state
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── Card.jsx         # Elevation-aware card with 5 shadow levels
│   │   │       ├── Button.jsx       # Primary / outline / ghost variants
│   │   │       ├── Navbar.jsx       # Navigation bar with theme toggle
│   │   │       └── ThemeToggle.jsx  # Sun/moon icon toggle button
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── pages/
│   │       │   │   ├── Login.jsx
│   │       │   │   └── Register.jsx
│   │       │   └── components/
│   │       │       └── protected.jsx
│   │       └── interview/
│   │           ├── pages/
│   │           │   ├── Home.jsx              # Generate interview form
│   │           │   ├── Interview.jsx         # 3-pane report dashboard
│   │           │   └── InterviewsList.jsx    # Previous interviews list
│   │           ├── components/
│   │           │   ├── ResumeStudioModal.jsx # Full-screen Resume Studio
│   │           │   ├── ResumeContentEditor.jsx  # Dynamic form builder
│   │           │   └── MockInterviewRoom.jsx    # Live mock interview UI
│   │           ├── hooks/
│   │           │   └── useInterview.js
│   │           └── services/
│   │               └── interview.api.js
│   └── package.json
│
└── README.md
```

---

## 📦 Prerequisites & System Requirements

- **Node.js**: `v20.0.0` or newer
- **npm**: `v10.0.0` or newer
- **MongoDB**: Local MongoDB or a MongoDB Atlas connection string
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)
- **Chromium / Chrome**: Required on the host OS for Puppeteer PDF rendering
- **Modern Browser**: Chrome or Edge strongly recommended (Web Speech API required for voice features)

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/interview-ai
JWT_SECRET=your-super-strong-jwt-secret-key
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODEL=gemini-2.0-flash
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set the backend origin in `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the Vite dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port the Express server listens on. |
| `CLIENT_URL` | **Yes** | `http://localhost:5173` | Exact frontend origin for CORS. |
| `MONGO_URI` | **Yes** | — | MongoDB connection URI. |
| `JWT_SECRET` | **Yes** | — | Secret for signing/verifying session tokens. |
| `GOOGLE_GEMINI_API_KEY` | **Yes** | — | Google AI Studio API key (server-side only). |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Primary Gemini model. |
| `GEMINI_FALLBACK_MODEL` | No | `gemini-2.0-flash` | Fallback model on rate-limit errors. |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:3000` | Base URL of the backend Express server. |

---

## 📡 API Reference

All `/api/interview/*` routes require a valid authenticated session via HTTP-only `token` cookie.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT cookie |
| `GET` | `/api/auth/logout` | Required | Invalidate token and clear cookie |
| `GET` | `/api/auth/get-me` | Required | Fetch current authenticated user profile |
| `POST` | `/api/interview/` | Required | Upload resume PDF + generate AI interview report |
| `GET` | `/api/interview/reports` | Required | List all interview reports for the user |
| `GET` | `/api/interview/report/:id` | Required | Fetch full details of one interview report |
| `PATCH` | `/api/interview/report/:id` | Required | Rename an interview report |
| `DELETE` | `/api/interview/report/:id` | Required | Permanently delete an interview report |
| `POST` | `/api/interview/evaluate-answer` | Required | Evaluate a practice answer with STAR AI feedback |
| `GET` | `/api/interview/resume/studio/:id` | Required | Get tailored resume JSON + ATS keyword scores |
| `PUT` | `/api/interview/resume/studio/:id` | Required | Save edited resume draft sections to MongoDB |
| `POST` | `/api/interview/resume/pdf/:id` | Required | Generate and stream tailored resume PDF (Puppeteer) |
| `POST` | `/api/interview/mock/:id/start` | Required | Initialize a mock interview session |
| `POST` | `/api/interview/mock/:id/turn` | Required | Submit candidate answer turn + receive coaching |
| `GET` | `/api/interview/mock/:id/session` | Required | Fetch active or completed mock session scorecard |

---

## 🧪 Verification & Quality Assurance

### Frontend Production Build
```bash
cd frontend && npm run build
# ✓ 5100+ modules transformed, 0 errors
```

### Backend Syntax Check
```bash
cd backend && node -e "require('./server.js')"
```

---

## 🛡️ Production Deployment

### Puppeteer Linux Dependencies
Required for PDF generation on Ubuntu/Debian servers:

```bash
sudo apt-get update && sudo apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
  libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 wget xdg-utils
```

### Nginx Config (Reverse Proxy)
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    location / {
        root /var/www/interview-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### Process Management (PM2)
```bash
cd backend
pm2 start server.js --name "interview-ai-api"
pm2 save && pm2 startup
```

---

## 🔒 Security

- **HTTP-Only Cookies**: JWTs are transmitted exclusively via `HttpOnly`, `SameSite` cookies to prevent XSS token theft.
- **Token Blacklist**: Logged-out tokens are stored in MongoDB with a native 3-day TTL index, preventing reuse.
- **Ownership Enforcement**: Every report query, update, delete, and PDF generation verifies the requesting user's ownership.
- **Input Validation**: Resume uploads validate MIME type (`application/pdf`) and are capped at 3MB in memory storage.
- **Secret Isolation**: All API keys and credentials remain strictly server-side. `.env` and `.env.local` are gitignored.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
