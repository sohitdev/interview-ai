# Interview AI

Interview AI is a full-stack application that turns a candidate resume and job description into a structured interview preparation report. It also generates a tailored resume PDF using the supplied resume template style.

## Features

- Account registration, login, logout, and authenticated sessions
- PDF resume upload and text extraction
- AI-generated match score, technical questions, behavioral questions, skill gaps, and preparation roadmap
- Persistent interview reports stored in MongoDB
- Template-based tailored resume PDF generation
- Candidate-specific PDF download filenames
- Cookie-based authentication with protected report ownership checks

## Repository layout

```text
.
├── backend/   Express API, MongoDB models, authentication, AI, and PDF generation
└── frontend/  React/Vite application and user interface
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB database, local or hosted
- Google Gemini API key with access to the configured models
- A Chromium-compatible environment for Puppeteer PDF generation

## Quick start

### 1. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in the values in `backend/.env`. Never commit that file.

### 2. Configure the frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Set `VITE_API_BASE_URL` to the backend origin. The local default is `http://localhost:3000`.

### 3. Start both applications

In one terminal:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in a browser.

## Environment configuration

Backend variables are documented in [backend/README.md](backend/README.md) and frontend variables are documented in [frontend/README.md](frontend/README.md). Commit only the `.env.example` files. They contain placeholders and no credentials.

## API overview

| Method | Route                                          | Auth     | Purpose                                          |
| ------ | ---------------------------------------------- | -------- | ------------------------------------------------ |
| `POST` | `/api/auth/register`                           | Public   | Create an account                                |
| `POST` | `/api/auth/login`                              | Public   | Start an authenticated session                   |
| `GET`  | `/api/auth/logout`                             | Public   | Clear the current session                        |
| `GET`  | `/api/auth/get-me`                             | Required | Get the current user                             |
| `POST` | `/api/interview`                               | Required | Upload a resume and generate an interview report |
| `GET`  | `/api/interview/reports`                       | Required | List the current user's reports                  |
| `GET`  | `/api/interview/report/:interviewId`           | Required | Get one owned report                             |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Required | Generate and download a tailored PDF             |

Authentication uses an HTTP cookie containing the JWT. The frontend sends credentials with API requests.

## Development commands

Backend:

```bash
npm run dev       # nodemon development server
npm start         # production-style Node server
```

Frontend:

```bash
npm run dev       # Vite development server
npm run lint      # ESLint
npm run build     # Production bundle
npm run preview   # Preview the production bundle
```

## Production checklist

- Use a strong, unique `JWT_SECRET` and rotate any credential that has ever been exposed.
- Use a restricted MongoDB user and allow only the application network to connect.
- Set `CLIENT_URL` to the exact deployed frontend origin.
- Set `VITE_API_BASE_URL` before building the frontend.
- Serve both applications over HTTPS.
- Keep `.env` files and build artifacts out of version control.
- Configure rate limiting, centralized error handling, monitoring, and a process manager before exposing the API publicly.
- Confirm the deployed environment supports Puppeteer and its Chromium dependencies.

## Security and secret handling

Real credentials must never appear in source files, README files, screenshots, logs, commits, or `.env.example` files. This repository ignores `.env` and local environment files. If a secret is accidentally committed or shared, revoke and rotate it immediately; deleting the file alone is not sufficient.

## License

No license has been declared for this project yet. Add an explicit license before distributing it publicly.
