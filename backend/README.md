# Interview AI — Backend API

> Express 5 REST API powering the Interview AI platform. Handles authentication, AI-driven interview report generation, resume PDF rendering, ATS keyword analysis, and live mock interview simulation.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
  - [Request Lifecycle](#request-lifecycle)
  - [AI Service Layer](#ai-service-layer)
  - [PDF Generation Pipeline](#pdf-generation-pipeline)
- [Database Schema](#database-schema)
  - [User](#user-usermodeljs)
  - [Token Blacklist](#token-blacklist-blacklistmodeljs)
  - [Interview Report](#interview-report-interviewreportmodeljs)
- [API Reference](#api-reference)
  - [Authentication](#authentication-apiauth)
  - [Interview Reports](#interview-reports-apiinterview)
  - [Answer Evaluation](#answer-evaluation)
  - [Resume Studio](#resume-studio)
  - [Mock Interviewer](#mock-interviewer)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Security](#security)
- [Production Deployment](#production-deployment)
  - [Puppeteer on Linux](#puppeteer-on-linux)
  - [Process Management](#process-management)
  - [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20.x LTS |
| Framework | Express | 5.x |
| Database | MongoDB + Mongoose | 6.x / 9.x |
| AI | Google Gemini (`@google/genai`) | 2.x |
| Schema Validation | Zod | 4.x |
| PDF Generation | Puppeteer (headless Chrome) | 25.x |
| PDF Parsing | pdf-parse | 2.x |
| Auth | JWT (`jsonwebtoken`) + bcrypt | 9.x / 6.x |
| File Upload | Multer | 2.x |
| HTTP Logging | Morgan | 1.x |

---

## Project Structure

```
backend/
├── server.js                        # Entry point: DB connect + HTTP server bootstrap
└── src/
    ├── app.js                       # Express app: middleware stack, route mounting
    ├── config/
    │   └── database.js              # Mongoose connection with retry logic
    ├── middlewares/
    │   ├── auth.middleware.js        # JWT verification + token blacklist check
    │   └── file.middleware.js        # Multer configuration (memory, 3MB, PDF only)
    ├── models/
    │   ├── user.model.js            # User accounts
    │   ├── blacklist.model.js       # JWT token blacklist (TTL 3 days)
    │   └── interviewReport.model.js # Core domain model (all interview data)
    ├── routes/
    │   ├── auth.routes.js           # /api/auth/*
    │   └── interview.routes.js      # /api/interview/*
    ├── controllers/
    │   ├── auth.controller.js       # Register, login, logout, getMe
    │   └── interview.controller.js  # All interview, resume, and mock operations
    └── services/
        └── ai.service.js            # Gemini prompts, Zod schemas, PDF HTML builder
```

---

## Getting Started

### Prerequisites

- **Node.js** `v20.0.0` or higher
- **npm** `v10.0.0` or higher
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Google Gemini API Key** — from [Google AI Studio](https://aistudio.google.com/)
- **Chromium / Chrome** — installed on the host OS (required by Puppeteer for PDF rendering)

### Installation

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables)).

### Development

```bash
npm run dev
# Starts nodemon hot-reload server on http://localhost:3000
```

---

## Environment Variables

Create `.env` in the `backend/` directory. **Never commit this file.**

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port the Express server binds to. |
| `CLIENT_URL` | **Yes** | `http://localhost:5173` | Exact frontend origin for CORS. Must match precisely. |
| `MONGO_URI` | **Yes** | — | MongoDB connection string (Atlas or local). |
| `JWT_SECRET` | **Yes** | — | High-entropy secret for signing/verifying JWT tokens. Minimum 32 characters recommended. |
| `GOOGLE_GEMINI_API_KEY` | **Yes** | — | Google AI Studio API key. Never expose client-side. |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Primary model for generation, evaluation, and coaching. |
| `GEMINI_FALLBACK_MODEL` | No | `gemini-2.0-flash` | Secondary model used automatically on `429`/`503` errors. |

---

## Architecture

### Request Lifecycle

```
Incoming HTTP Request
        │
        ▼
Morgan HTTP Logger
        │
        ▼
CORS (origin: CLIENT_URL, credentials: true)
        │
        ▼
Cookie Parser + JSON Body Parser
        │
        ▼
Route Matching
 ├── /api/auth/*  →  Auth Routes (public)
 └── /api/interview/*
        │
        ▼
auth.middleware.js
  ├── Extract JWT from cookie
  ├── Verify signature (JWT_SECRET)
  ├── Check token against blacklist collection
  └── Attach req.user = { id, username, email }
        │
        ▼
file.middleware.js (where applicable)
  ├── Accept multipart/form-data
  ├── Validate MIME type = application/pdf
  ├── Enforce 3MB memory limit
  └── Attach req.file
        │
        ▼
Controller
  ├── Validate inputs
  ├── Enforce resource ownership (report.user === req.user.id)
  ├── Call ai.service.js functions
  └── Send JSON or PDF binary response
```

### AI Service Layer

`ai.service.js` centralizes all interactions with the Gemini API. Each generation call:

1. Builds a deterministic text prompt with the candidate's data
2. Passes a **Zod schema** as a JSON Schema response constraint to the Gemini SDK
3. Parses and validates the response with `zod.parse()` before returning

Functions exposed:

| Function | Description |
|---|---|
| `generateInterviewReport(...)` | Full report: skill gaps, technical + behavioral questions, prep plan, match score |
| `generateStructuredResumeData(...)` | AI-tailored resume content from raw resume text + JD |
| `generateResumePdf(...)` | Calls `generateStructuredResumeData` if needed, then runs Puppeteer |
| `buildResumeHtml(resumeData, template)` | Pure function — builds HTML string for `classic`, `modern`, or `minimal` templates |
| `extractAtsKeywords(...)` | Analyzes resume vs. JD, returns matched/missing keywords + score (0–100) |
| `evaluateCandidateAnswer(...)` | STAR methodology scoring (0–10), feedback, and model answer |
| `generateMockInterviewTurn(...)` | Stateful conversational response + next question + optional final scorecard |

### PDF Generation Pipeline

```
POST /api/interview/resume/pdf/:id
        │
        ▼
Fetch interviewReport from MongoDB (ownership check)
        │
        ▼
ai.service.generateResumePdf({ resumeData, template })
        │
        ├── If no resumeData: call generateStructuredResumeData()
        │
        ▼
buildResumeHtml(resumeData, template)
  ├── Constructs section HTML conditionally (empty sections are omitted)
  ├── Injects template-specific CSS (Classic / Modern / Minimal)
  └── Supports: objective, education, skills, experience,
               projects (with bullets), extracurricular,
               leadership, customSections[]
        │
        ▼
puppeteer.launch({ headless: "shell" })
  └── page.setContent(html) → page.pdf({ format: "Letter" })
        │
        ▼
res.set("Content-Type", "application/pdf")
res.send(pdfBuffer)
```

---

## Database Schema

### User (`user.model.js`)

| Field | Type | Constraints |
|---|---|---|
| `username` | String | Required, unique, trimmed |
| `email` | String | Required, unique, lowercase, trimmed |
| `password` | String | Required, bcrypt-hashed |
| `createdAt` / `updatedAt` | Date | Auto-managed by Mongoose timestamps |

### Token Blacklist (`blacklist.model.js`)

| Field | Type | Notes |
|---|---|---|
| `token` | String | Required, indexed |
| `createdAt` | Date | MongoDB TTL index: `expireAfterSeconds: 259200` (3 days) |

Tokens are added on logout and on any suspicious invalid-token attempt. MongoDB's background reaper automatically purges expired entries without application-level cron jobs.

### Interview Report (`interviewReport.model.js`)

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId (ref: User) | Owner. All queries filter by this field. |
| `title` | String | Display name for the report |
| `jobDescription` | String | Target job posting content |
| `resume` | String | Raw extracted text from the uploaded PDF |
| `selfDescription` | String | Optional candidate bio / additional context |
| `matchScore` | Number (0–10) | Overall resume-to-JD alignment score |
| `technicalQuestions` | Array | `{ question, intention, answer, example }` |
| `behavioralQuestions` | Array | `{ question, intention, answer, example }` |
| `skillGap` | Array | `{ skill: String, severity: "low" \| "medium" \| "high" }` |
| `preparationPlan` | Array | `{ day: Number, focus: String, tasks: [String] }` |
| `practiceAnswers` | Array | Candidate submissions: question, type, answer, score (0–10), STAR feedback, exemplar |
| `tailoredResumeData` | Mixed | Structured JSON for the Resume Studio (see below) |
| `atsKeywords` | Object | `{ matched: [String], missing: [String], score: Number }` |
| `mockInterviewSessions` | Array | `{ status, messages: [{ role, content, score, feedback }], finalSummary }` |

**`tailoredResumeData` shape:**

```js
{
  name, email, phone, location, linkedin, website,  // personal info
  objective,                                          // summary
  education: [{ degree, institution, dates, details }],
  skills: [{ category, items: [String] }],
  experience: [{ role, company, dates, location, bullets: [String] }],
  projects: [{ title, description?, bullets?: [String] }],
  extracurricularActivities: [String],
  leadership: [String],
  customSections: [{ heading: String, items: [String] }]  // arbitrary user sections
}
```

---

## API Reference

All `/api/interview/*` routes require a valid authenticated session cookie (`token`).

### Authentication (`/api/auth`)

#### `POST /api/auth/register`
Create a new user account.

**Body:**
```json
{ "username": "alexdev", "email": "alex@example.com", "password": "StrongPass123!" }
```

**Response `201`:**
```json
{ "message": "User registered successfully", "user": { "id": "...", "username": "alexdev", "email": "..." }, "status": "success" }
```

---

#### `POST /api/auth/login`
Authenticate and set an HTTP-only JWT cookie.

**Body:**
```json
{ "email": "alex@example.com", "password": "StrongPass123!" }
```

**Response `200`:** Sets `token` cookie (HttpOnly, SameSite=Strict). Returns user object.

---

#### `GET /api/auth/logout`
Invalidate the current session token and add it to the blacklist.

**Response `200`:** Clears cookie. Returns success message.

---

#### `GET /api/auth/get-me`
Fetch the currently authenticated user's profile.

**Response `200`:**
```json
{ "user": { "id": "...", "username": "alexdev", "email": "alex@example.com" }, "status": "success" }
```

---

### Interview Reports (`/api/interview`)

#### `POST /api/interview/`
Generate a new AI interview report. Accepts multipart form data.

**Form Fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| `resume` | File (PDF) | No | Candidate resume PDF (max 3MB) |
| `jobDescription` | String | **Yes** | Target job description text |
| `selfDescription` | String | No | Additional context about the candidate |

**Response `201`:** Full generated `interviewReport` document.

---

#### `GET /api/interview/reports`
List all interview reports belonging to the authenticated user.

**Response `200`:**
```json
{ "interviewReports": [...], "status": "success" }
```

---

#### `GET /api/interview/report/:interviewId`
Fetch the complete details of a single interview report.

**Response `200`:** Full `interviewReport` document.

---

#### `PATCH /api/interview/report/:interviewId`
Rename an interview report.

**Body:**
```json
{ "title": "Google SWE Interview Prep" }
```

**Response `200`:** Updated report.

---

#### `DELETE /api/interview/report/:interviewId`
Permanently delete an interview report.

**Response `200`:** Success message.

---

### Answer Evaluation

#### `POST /api/interview/evaluate-answer`
Submit a candidate's practice answer for AI evaluation using STAR methodology.

**Body:**
```json
{
  "interviewId": "<reportId>",
  "question": "Tell me about a time you optimized a slow system.",
  "questionType": "technical",
  "candidateAnswer": "Our MongoDB pipeline was taking 4 seconds...",
  "intention": "Assess problem-solving and impact measurement",
  "modelAnswer": "A senior engineer would..."
}
```

**Response `200`:**
```json
{
  "score": 7,
  "strengths": ["Clear problem statement", "Quantified impact"],
  "improvements": ["Could elaborate on monitoring strategy"],
  "starFeedback": { "situation": "...", "task": "...", "action": "...", "result": "..." },
  "refinedAnswer": "A strong answer would open with..."
}
```

---

### Resume Studio

#### `GET /api/interview/resume/studio/:interviewReportId`
Retrieve the tailored resume JSON and ATS keyword analysis for a report.

**Response `200`:**
```json
{
  "resumeData": { "name": "...", "experience": [...], "customSections": [...] },
  "atsKeywords": { "matched": ["React", "Node.js"], "missing": ["Kafka"], "score": 72 }
}
```

---

#### `PUT /api/interview/resume/studio/:interviewReportId`
Save the user's edited resume data back to MongoDB.

**Body:**
```json
{ "resumeData": { "name": "...", "customSections": [{ "heading": "Certifications", "items": ["AWS SAA"] }] } }
```

**Response `200`:** Updated report.

---

#### `POST /api/interview/resume/pdf/:interviewReportId`
Generate and stream a tailored resume as a PDF binary.

**Query Parameters:**
| Param | Values | Default |
|---|---|---|
| `template` | `classic` \| `modern` \| `minimal` | `classic` |

**Body (optional):**
```json
{ "resumeData": { ... } }
```

If `resumeData` is provided in the body, it is used directly (useful for previewing unsaved edits). Otherwise, the saved `tailoredResumeData` from MongoDB is used.

**Response `200`:** `Content-Type: application/pdf` binary stream.

---

### Mock Interviewer

#### `POST /api/interview/mock/:interviewId/start`
Initialize a new mock interview session. Resets any previous session.

**Response `200`:** Initial interviewer greeting and first question.

---

#### `POST /api/interview/mock/:interviewId/turn`
Submit the candidate's answer for the current turn.

**Body:**
```json
{ "candidateAnswer": "I believe event-driven architecture solves this because..." }
```

**Response `200`:**
```json
{
  "feedback": "Strong opening. Quantify the latency improvement next time.",
  "score": 8,
  "interviewerResponse": "Good point. Let me follow up with...",
  "nextQuestion": "How would you handle backpressure in that design?",
  "isCompleted": false
}
```

When `isCompleted: true`, the response additionally includes:
```json
{
  "isCompleted": true,
  "finalSummary": {
    "overallScore": 7.5,
    "communicationRating": "Strong",
    "technicalRating": "Proficient",
    "feedback": "Demonstrated solid fundamentals..."
  }
}
```

---

#### `GET /api/interview/mock/:interviewId/session`
Fetch the latest mock interview session for a report (in-progress or completed).

**Response `200`:**
```json
{ "session": { "status": "completed", "messages": [...], "finalSummary": { ... } } }
```

---

## Middleware

### `auth.middleware.js`
Applied to all `/api/interview/*` routes.

1. Reads `token` from `req.cookies`
2. Verifies signature with `JWT_SECRET` using `jsonwebtoken`
3. Checks the token against the `blacklist` collection in MongoDB
4. On success, attaches `req.user = { id, username, email }` and calls `next()`
5. On failure, returns `401 Unauthorized`

### `file.middleware.js`
Applied only to `POST /api/interview/` (report generation).

- Uses Multer in memory storage mode (no disk writes)
- Validates `mimetype === "application/pdf"`
- Rejects files larger than 3MB
- Attaches `req.file.buffer` for downstream pdf-parse extraction

---

## Error Handling

Controllers follow a consistent error response shape:

```json
{ "message": "Human-readable error description", "status": "error" }
```

AI generation endpoints additionally handle Gemini provider errors:

| HTTP Status | Trigger | Response |
|---|---|---|
| `400` | Missing required fields | Validation error message |
| `401` | Invalid / missing / blacklisted token | Auth error |
| `403` | Accessing a report belonging to another user | Ownership error |
| `404` | Report not found | Not found error |
| `503` | Gemini API rate-limited or unavailable (`429`, `502`, `503`, `504`) | Service temporarily unavailable |
| `500` | Unexpected server error | Internal server error |

---

## Security

| Control | Implementation |
|---|---|
| **JWT Transmission** | HTTP-only, `SameSite=Strict` cookies — never exposed to JavaScript |
| **Token Revocation** | Logged-out tokens added to MongoDB blacklist with 3-day auto-TTL |
| **Ownership Enforcement** | Every report operation checks `report.user.toString() === req.user.id` |
| **File Validation** | MIME type check + 3MB hard limit in Multer config |
| **Secret Isolation** | All credentials in `.env` (gitignored). Never bundled client-side. |
| **CORS Whitelist** | `CLIENT_URL` env var — single trusted origin, no wildcard |

---

## Production Deployment

### Puppeteer on Linux

Puppeteer requires OS-level Chromium shared libraries. On Ubuntu/Debian:

```bash
sudo apt-get update && sudo apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
  libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 wget xdg-utils
```

On Docker, additionally add `--no-sandbox` to Puppeteer launch args:
```js
puppeteer.launch({ headless: "shell", args: ["--no-sandbox", "--disable-setuid-sandbox"] })
```

### Process Management

```bash
npm install -g pm2

# Start with cluster mode (one process per CPU core)
pm2 start server.js --name "interview-ai-api" -i max

# Persist process list across reboots
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Increase buffer for PDF binary responses
    proxy_buffers         16 16k;
    proxy_buffer_size     16k;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;

        # Required for cookie-based auth across origins
        proxy_set_header   Cookie            $http_cookie;
    }
}
```

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `nodemon server.js` | Development server with hot reload |
| `npm start` | `node server.js` | Production process (no auto-restart) |

---

## Troubleshooting

**`Error: Failed to launch the browser process!`**
> Missing Chromium OS libraries. Run the apt-get install block above. In Docker, ensure `--no-sandbox` is passed to `puppeteer.launch()`.

**Gemini returns `429 Too Many Requests`**
> The service automatically falls back to `GEMINI_FALLBACK_MODEL`. If both are rate-limited, the endpoint returns `503`. Check your quota in [Google AI Studio](https://aistudio.google.com/).

**Cookies not sent cross-origin**
> Ensure:
> 1. Frontend requests use `axios` with `withCredentials: true`
> 2. Backend CORS sets `credentials: true` and `origin: CLIENT_URL` (not `*`)
> 3. In production, both client and server are served over HTTPS

**PDF response is empty or has missing sections**
> Empty sections are intentionally omitted by the HTML builder. If a section like `projects` has zero items or blank text, it will not appear in the PDF. This is by design.

**`MongoServerError: querySrv ECONNREFUSED`**
> The app is running without network access (e.g., inside a restricted sandbox). Ensure MongoDB Atlas IP allowlist includes your server's public IP, or use a local MongoDB instance for development.
