# Interview AI Backend

Express API for authentication, resume parsing, interview report generation, MongoDB persistence, and tailored resume PDF generation.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB
- Google Gemini API access
- Chromium support for Puppeteer PDF generation

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The API listens on `PORT` and defaults to `http://localhost:3000`.

## Environment variables

Create `.env` from `.env.example` and replace every placeholder:

| Variable                | Required | Description                                                             |
| ----------------------- | -------- | ----------------------------------------------------------------------- |
| `PORT`                  | No       | HTTP port. Defaults to `3000`.                                          |
| `CLIENT_URL`            | Yes      | Exact frontend origin allowed by CORS, such as `http://localhost:5173`. |
| `MONGO_URI`             | Yes      | MongoDB connection string.                                              |
| `JWT_SECRET`            | Yes      | Long, random secret used to sign and verify JWTs.                       |
| `GOOGLE_GEMINI_API_KEY` | Yes      | Google Gemini API key. Keep this server-side only.                      |
| `GEMINI_MODEL`          | No       | Primary generation model. Defaults to `gemini-3.6-flash`.               |
| `GEMINI_FALLBACK_MODEL` | No       | Fallback generation model. Defaults to `gemini-3.5-flash`.              |

Never expose backend variables through frontend `VITE_` variables. Never commit `.env`.

## Scripts

| Command       | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| `npm run dev` | Start the API with nodemon                                       |
| `npm start`   | Start the API with Node                                          |
| `npm test`    | Placeholder test command; automated tests are not configured yet |

## API routes

### Authentication

- `POST /api/auth/register` - body: `{ username, email, password }`
- `POST /api/auth/login` - body: `{ email, password }`
- `GET /api/auth/logout` - clears the authentication cookie
- `GET /api/auth/get-me` - returns the authenticated user

### Interviews

- `POST /api/interview` - authenticated multipart request with `resume`, `jobDescription`, and optional `selfDescription`
- `GET /api/interview/reports` - returns the authenticated user's report summaries
- `GET /api/interview/report/:interviewId` - returns one report owned by the authenticated user
- `POST /api/interview/resume/pdf/:interviewReportId` - generates and returns an application/pdf response

Resume uploads are held in memory and limited to 3 MB. The PDF report endpoint verifies both the report ID and authenticated user before generating a file.

## Request examples

Register:

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","email":"demo@example.com","password":"replace-this-password"}'
```

Generate an interview report:

```bash
curl -i -X POST http://localhost:3000/api/interview \
  -b cookies.txt -c cookies.txt \
  -F 'resume=@./resume.pdf' \
  -F 'jobDescription=Backend software engineer' \
  -F 'selfDescription=Candidate profile'
```

The report generation request requires an authenticated session. Log in first and store the returned cookie in the same cookie jar.

## Architecture

```text
server.js
  └── src/app.js
      ├── auth routes -> auth controllers -> user/blacklist models
      └── interview routes -> controllers -> MongoDB models
                                      └── AI service -> Gemini + Puppeteer
```

The AI service uses structured JSON schemas for report and resume content. Resume HTML is rendered by the application with an ATS-friendly template before Puppeteer creates the PDF.

## Production operations

- Run behind HTTPS and a reverse proxy.
- Use a process manager or container orchestrator.
- Restrict `CLIENT_URL` to the real frontend origin.
- Use a least-privilege MongoDB account and network allowlist.
- Rotate `JWT_SECRET`, MongoDB credentials, and Gemini keys regularly.
- Add request rate limiting, structured logging, health checks, and automated tests before public deployment.
- Verify Puppeteer Chromium dependencies in the deployment image.

## Secret handling

`.env.example` contains placeholders only. Keep `.env` untracked. Never paste credentials into issues, pull requests, logs, README files, or screenshots. Revoke and replace any credential that was exposed.
