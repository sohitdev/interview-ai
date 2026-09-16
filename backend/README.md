# ⚡ Interview AI — Backend API Engine

Express API powering **Interview AI**, a full-stack AI career intelligence and interview simulation platform. Built with Node.js, Express, MongoDB, Google Gemini AI, and Puppeteer headless PDF generation.

---

## 📋 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [System Requirements](#-system-requirements)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Environment Variables](#-environment-variables)
- [Database Models & Schemas](#-database-models--schemas)
- [API Route Catalog](#-api-route-catalog)
- [Sample cURL Examples](#-sample-curl-examples)
- [NPM Scripts](#-npm-scripts)
- [Production Deployment](#-production-deployment)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🏛️ Architectural Overview

```
server.js (HTTP Listener & DB Connection)
   └── src/app.js (Express Application Pipeline)
       ├── Global Middlewares (CORS, Cookie Parser, JSON, Multer)
       ├── Routes (/api/auth, /api/interview)
       │    ├── Auth Middleware (JWT Verification & Blacklist Guard)
       │    ├── File Upload Middleware (Multer Memory Storage, 3MB Limit)
       │    └── Controllers (Validation, Business Logic, Error Handling)
       └── Services Layer
            └── ai.service.js
                ├── Gemini GenAI Client (structured JSON prompts with Zod schemas)
                ├── Puppeteer (headless Chrome → PDF buffer)
                └── buildResumeHtml() — 3 templates: Classic, Modern, Minimal
```

---

## 📦 System Requirements

- **Node.js**: `v20.0.0` or higher (LTS recommended)
- **npm**: `v10.0.0` or higher
- **MongoDB**: `v6.0` or higher (local or Atlas cluster)
- **Google Gemini API Key**: Enabled from [Google AI Studio](https://aistudio.google.com/)
- **Chromium / Chrome**: Required on the host OS for Puppeteer PDF rendering

---

## 🚀 Quick Start & Local Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port the Express server listens on. |
| `CLIENT_URL` | **Yes** | `http://localhost:5173` | Exact frontend origin for CORS. |
| `MONGO_URI` | **Yes** | — | MongoDB connection URI. |
| `JWT_SECRET` | **Yes** | — | High-entropy secret for signing session JWT tokens. |
| `GOOGLE_GEMINI_API_KEY` | **Yes** | — | Google AI Studio API key (server-side only). |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Primary Gemini model. |
| `GEMINI_FALLBACK_MODEL` | No | `gemini-2.0-flash` | Fallback model on rate-limit/quota errors. |

---

## 🗄️ Database Models & Schemas

### User (`user.model.js`)
- `username`, `email`, `password` (bcrypt hashed), `timestamps`

### Token Blacklist (`tokenBlacklist.model.js`)
- `token` (indexed) with a MongoDB **TTL index** of 3 days for automatic expiry of logged-out tokens.

### Interview Report (`interviewReport.model.js`)
- `user` — ObjectId ref (ownership enforced on all queries)
- `title`, `jobDescription`, `resume` (raw text), `selfDescription`
- `matchScore` — Number 0–10
- `technicalQuestions`, `behavioralQuestions` — `{ question, intention, answer, example }`
- `skillGap` — `{ skill, severity: 'low' | 'medium' | 'high' }`
- `preparationPlan` — `{ day, focus, tasks: [String] }`
- `practiceAnswers` — candidate submissions with STAR feedback, 0–10 score, exemplar answer
- `tailoredResumeData` — Structured JSON for the Resume Studio:
  - `name`, `email`, `phone`, `location`, `linkedin`, `website`
  - `objective` (summary)
  - `education[]`, `skills[]`, `experience[]`, `projects[]`
  - `extracurricularActivities[]`, `leadership[]`
  - `customSections[]` — arbitrary user-defined sections with a `heading` and `items[]`
- `atsKeywords` — `{ matched: [String], missing: [String], score: Number }`
- `mockInterviewSessions[]` — full turn history with scores and final scorecard

---

## 📡 API Route Catalog

All `/api/interview/*` routes require a valid `token` cookie (HTTP-only JWT).

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user, set JWT cookie |
| `GET` | `/api/auth/logout` | Required | Invalidate token, clear cookie |
| `GET` | `/api/auth/get-me` | Required | Fetch authenticated user profile |

### Interview Reports (`/api/interview`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/interview/` | Required | Upload resume PDF + generate AI interview report |
| `GET` | `/api/interview/reports` | Required | List all reports for the logged-in user |
| `GET` | `/api/interview/report/:id` | Required | Fetch full report details |
| `PATCH` | `/api/interview/report/:id` | Required | Rename a report |
| `DELETE` | `/api/interview/report/:id` | Required | Permanently delete a report |

### Practice & Evaluation

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/interview/evaluate-answer` | Required | Evaluate a candidate answer using STAR AI feedback (0–10 score + model answer) |

### Resume Studio

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/interview/resume/studio/:id` | Required | Get tailored resume JSON + ATS keyword match data |
| `PUT` | `/api/interview/resume/studio/:id` | Required | Save edited resume sections to MongoDB |
| `POST` | `/api/interview/resume/pdf/:id` | Required | Generate and stream tailored resume PDF. Accepts `?template=classic\|modern\|minimal` and optional `{ resumeData }` body. Supports custom sections. Empty sections are omitted from the PDF. |

### Mock Interview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/interview/mock/:id/start` | Required | Initialize a mock interview session |
| `POST` | `/api/interview/mock/:id/turn` | Required | Submit candidate answer turn + receive coaching |
| `GET` | `/api/interview/mock/:id/session` | Required | Fetch current session transcript and scorecard |

---

## 💻 Sample cURL Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alexdev","email":"alex@example.com","password":"StrongPassword123!"}'
```

### Login (saves cookie)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"alex@example.com","password":"StrongPassword123!"}'
```

### Generate Interview Report
```bash
curl -X POST http://localhost:3000/api/interview \
  -b cookies.txt \
  -F "resume=@./sample-resume.pdf" \
  -F "jobDescription=Senior Full Stack Engineer - React, Node.js, MongoDB" \
  -F "selfDescription=5 years of experience building SaaS products."
```

### Evaluate Practice Answer
```bash
curl -X POST http://localhost:3000/api/interview/evaluate-answer \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "interviewId": "65fc1234567890abcdef1234",
    "question": "Tell me about a time you optimized a slow database query.",
    "questionType": "technical",
    "candidateAnswer": "Our MongoDB pipeline took 4s. I added a compound index and reduced it to 45ms."
  }'
```

### Download Resume PDF (Modern Template)
```bash
curl -X POST "http://localhost:3000/api/interview/resume/pdf/65fc1234567890abcdef1234?template=modern" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -o resume.pdf
```

---

## 🛠️ NPM Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `nodemon server.js` | Hot-reloading development server |
| `npm start` | `node server.js` | Production node process |

---

## 🛡️ Production Deployment

### Puppeteer Linux Dependencies (Ubuntu/Debian)
```bash
sudo apt-get update && sudo apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
  libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 wget xdg-utils
```

### Process Management (PM2)
```bash
npm install -g pm2
pm2 start server.js --name "interview-ai-api" -i max
pm2 save && pm2 startup
```

### Security Checklist
- **Secure Cookies**: Set `secure: true`, `httpOnly: true`, `sameSite: "strict"` in production.
- **Strict CORS**: `CLIENT_URL` must point to your exact production domain — never use `*`.
- **Rate Limiting**: Add `express-rate-limit` on auth and AI generation endpoints.
- **Secret Rotation**: Regularly rotate `JWT_SECRET` and `GOOGLE_GEMINI_API_KEY`.
- **MongoDB Auth**: Enforce SCRAM authentication and IP allowlisting on Atlas clusters.

---

## ❓ Troubleshooting & FAQ

**Q: Puppeteer throws `Failed to launch the browser process!`**
> Install the Chromium OS dependencies listed above, or add `--no-sandbox` flags if running inside Docker.

**Q: Gemini API throws rate limit or quota errors.**
> The application includes automatic fallback to `GEMINI_FALLBACK_MODEL`. Ensure your AI Studio project has sufficient quota enabled.

**Q: Cookies are not sent cross-origin.**
> The frontend must send requests with `credentials: "include"`, and the backend CORS must explicitly set `credentials: true` with `CLIENT_URL` matching the exact frontend origin.

**Q: PDF is blank or has missing sections.**
> Empty sections (empty arrays or blank strings) are intentionally omitted from the generated PDF. This is by design — the conditional renderer skips empty content to avoid blank headings.
