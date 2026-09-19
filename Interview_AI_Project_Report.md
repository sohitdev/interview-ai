# ⚡ Interview AI — Comprehensive Project Report

## 1. Executive Summary
**Interview AI** is an end-to-end, AI-powered career intelligence and interview preparation platform. It is designed to bridge the gap between candidate resumes and specific job descriptions. By utilizing generative AI and real-time audio interaction, it evaluates skill gaps, scores answers using the STAR methodology, builds dynamic ATS-friendly resumes, and simulates live technical and behavioral mock interviews.

## 2. Platform Capabilities (What It Does)

### 📊 Career Intelligence & Gap Analysis
- Analyzes candidate resumes (PDFs) and self-descriptions against target job descriptions.
- Calculates a **Match Score (0-100)** to measure overall profile alignment.
- Identifies **Skill Gaps** categorized by severity (Low, Medium, High).
- Generates an adaptive, day-by-day customized **Preparation Roadmap**.

### 🎤 STAR Method Evaluation ("Practice Your Answer")
- Automatically generates role-specific technical and behavioral questions.
- Built-in **Voice Dictation (Speech-to-Text)** using the browser's Web Speech API for hands-free answering.
- Employs **STAR Diagnostics (Situation, Task, Action, Result)** to evaluate answers.
- Provides quantitative scores (0-10), strengths, areas for improvement, and AI-generated top-tier "Exemplar Answers".

### 📄 Dynamic Resume Studio & ATS Checking
- A full-screen interactive workspace to edit resume content (Experience, Projects, Education, Custom Sections).
- Features **Live PDF Preview** rendered via `<iframe>` for real-time visual feedback.
- Includes 3 distinct **Designer PDF Templates** (Classic, Modern, Minimal).
- **ATS Keyword Audit**: Visualizes matching and missing keywords based on the job description to optimize for Applicant Tracking Systems.

### 🤖 Interactive AI Mock Interviewer
- Simulates a turn-by-turn conversational roleplay with a senior technical interviewer.
- Utilizes **Text-to-Speech (TTS)** to read questions aloud in real-time.
- Provides per-turn coaching and an **Executive Scorecard** at the end detailing communication and technical ratings.

---

## 3. Technology Stack (What We Used)

### Frontend (Client-Side)
- **Framework**: React 19 (Single Page Application)
- **Build Tool**: Vite (Lightning-fast HMR and optimized production builds)
- **Styling**: Tailwind CSS v4 (Custom design tokens, light/dark canvas themes, layered shadows)
- **Animations**: Framer Motion (Smooth layout transitions and entrance animations)
- **Icons**: Phosphor Icons
- **Fonts**: Geist Sans & Geist Mono (Premium typography system)
- **Routing**: React Router v8

### Backend (Server-Side)
- **Environment**: Node.js (v20+)
- **Framework**: Express.js v5
- **Authentication**: JWT (JSON Web Tokens) via HttpOnly, SameSite strict cookies.
- **File Uploads**: Multer (In-memory storage for PDF parsing)
- **PDF Generation**: Puppeteer (Headless Chromium browser rendering HTML to PDF buffers)
- **Text Extraction**: `pdf-parse`

### Artificial Intelligence
- **LLM Engine**: Google Gemini API (`@google/genai` SDK)
- **Primary Model**: `gemini-2.5-flash`
- **Fallback Model**: `gemini-2.0-flash` (used if rate limits are hit)
- **Capabilities**: Uses structured JSON schema output parsing to ensure 100% deterministic data extraction from the AI.

### Database
- **Database**: MongoDB
- **ODM**: Mongoose v9
- **Core Entities**: Users, Interview Reports, Mock Interview Sessions, Token Blacklists.

---

## 4. Deployment Architecture (Where It Is Deployed)

The platform utilizes a decoupled deployment strategy to optimize for performance and scalability:

### 🌐 Frontend Deployment: Vercel
- The React application is deployed continuously on **Vercel**.
- Vercel acts as a global CDN, delivering the static assets compiled by Vite with extremely low latency.
- It seamlessly handles React Router's client-side routing so single-page navigation works correctly.

### ⚙️ Backend Deployment: Render
- The Express API is hosted on **Render** using a custom **Docker** runtime (configured via `render.yaml`).
- **Why Docker?** The backend relies on Puppeteer to generate high-quality resume PDFs. Puppeteer requires a headless Chromium binary and several Linux-specific system dependencies (like `libx11`, `libgbm`, `libnss3`) which are cleanly managed via the provided `Dockerfile`.
- Render automatically syncs with your GitHub repository and rebuilds the Docker container on every push to the `main` branch.

### 💾 Database Hosting: MongoDB Atlas
- The application data is hosted on **MongoDB Atlas**, a fully managed cloud database cluster.
- It provides high availability, automated backups, and secure URI connections for the Render backend.

---

## 5. Security & Best Practices
- **Session Security**: Uses `HttpOnly` and `SameSite` configurations for JWT cookies. The token is completely invisible to client-side JavaScript, effectively neutralizing Cross-Site Scripting (XSS) token theft.
- **Logout Invalidation**: Employs a Token Blacklist collection with a 3-day MongoDB TTL (Time-To-Live) index to physically invalidate logged-out tokens.
- **Data Ownership**: Every CRUD action strictly verifies the requesting user's ID against the resource's assigned owner in MongoDB before returning or mutating data.
- **Environment Isolation**: All sensitive credentials (Google API keys, JWT secrets, Mongo URIs) are securely managed via `.env` files locally and Environment Variables inside Render and Vercel.
