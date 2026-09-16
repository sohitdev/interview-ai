# Interview AI — Frontend

> React 19 single-page application powering the Interview AI career intelligence platform. Built with Vite 8, Tailwind CSS v4, and Framer Motion.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Production Build](#production-build)
- [Environment Variables](#environment-variables)
- [Design System](#design-system)
  - [Theme Architecture](#theme-architecture)
  - [Color Tokens](#color-tokens)
  - [Typography](#typography)
  - [Shadow Elevation](#shadow-elevation)
- [Application Routing](#application-routing)
- [Feature Modules](#feature-modules)
  - [Authentication](#authentication)
  - [Interview Dashboard](#interview-dashboard)
  - [Resume Studio](#resume-studio)
  - [Mock Interview Room](#mock-interview-room)
- [State Management & Context](#state-management--context)
- [API Integration](#api-integration)
- [Component Library](#component-library)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Library | React | 19.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | v4.x |
| Animations | Motion (Framer Motion) | 13.x |
| Routing | React Router | 8.x |
| HTTP Client | Axios | 1.x |
| Icons | Phosphor Icons | 2.x |
| Fonts | Geist Sans / Geist Mono | 5.x |
| Linting | ESLint | 10.x |

---

## Project Structure

```
frontend/
├── index.html
├── vite.config.js
├── eslint.config.js
└── src/
    ├── main.jsx                          # React root, providers mounting
    ├── App.jsx                           # Router, route definitions, ThemeProvider
    ├── index.css                         # Tailwind v4 @theme + :root / .dark CSS vars
    │
    ├── context/
    │   ├── auth.context.jsx              # User session state (login, register, logout)
    │   ├── theme.context.jsx             # Dark/light toggle, localStorage persistence
    │   └── toast.context.jsx            # Global notification queue
    │
    ├── components/
    │   └── ui/
    │       ├── Button.jsx               # Variants: primary | outline | ghost
    │       ├── Card.jsx                 # Elevation-aware surface (levels 1–5)
    │       ├── Input.jsx                # Controlled input with label and error state
    │       ├── Navbar.jsx               # App navigation, auth state, theme toggle
    │       └── ThemeToggle.jsx          # Sun/moon icon button (uses ThemeContext)
    │
    └── features/
        ├── auth/
        │   ├── pages/
        │   │   ├── Login.jsx            # Sign-in form with theme toggle
        │   │   └── Register.jsx         # Registration form with theme toggle
        │   ├── components/
        │   │   └── Protected.jsx        # Route guard, redirects unauthenticated users
        │   ├── hooks/
        │   │   └── useAuth.js           # Auth hook (consumes AuthContext)
        │   └── services/
        │       └── auth.api.js          # Axios calls: login, register, logout, getMe
        │
        └── interview/
            ├── pages/
            │   ├── Home.jsx             # Generate interview form (JD + resume upload)
            │   ├── Interview.jsx        # 3-pane report dashboard (questions, plan, sidebar)
            │   └── InterviewsList.jsx   # Previous interviews grid (/interviews route)
            ├── components/
            │   ├── ResumeStudioModal.jsx     # Full-screen Resume Studio workspace
            │   ├── ResumeContentEditor.jsx   # Dynamic form builder (add/delete sections)
            │   └── MockInterviewRoom.jsx     # Live AI mock interviewer UI (TTS + STT)
            ├── hooks/
            │   └── useInterview.js      # Data fetching and report state
            └── services/
                └── interview.api.js     # All interview-related Axios API calls
```

---

## Getting Started

### Prerequisites

- **Node.js** `v20.0.0` or newer
- **npm** `v10.0.0` or newer
- Backend API running (see [`backend/README.md`](../backend/README.md))
- A modern Chromium-based browser (Chrome / Edge) for Web Speech API support

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Copy environment template
cp .env.example .env.local

# Start the Vite dev server with HMR
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
# Output: dist/ directory (static assets, ready to serve via Nginx or CDN)

# Preview production build locally
npm run preview
```

---

## Environment Variables

Create `.env.local` in the `frontend/` directory. This file is gitignored.

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:3000` | Full base URL of the backend Express API server. |

> **Note:** Only variables prefixed with `VITE_` are exposed to the browser bundle. Never put secrets in frontend env files.

---

## Design System

### Theme Architecture

The entire design system is defined in [`src/index.css`](src/index.css) using native CSS custom properties. Tailwind's `@theme` block maps these variables to utility classes.

Dark mode is toggled by adding/removing the `.dark` class on `<html>` — managed by `ThemeContext`. The preference is persisted to `localStorage` and the initial value respects the OS `prefers-color-scheme` setting.

```
ThemeContext
  └── reads localStorage or prefers-color-scheme
  └── toggles .dark on document.documentElement
  └── exposes { isDark, toggleTheme }

ThemeToggle.jsx
  └── reads isDark from ThemeContext
  └── renders Sun or Moon icon
```

### Color Tokens

All tokens are available as Tailwind utilities (`text-ink`, `bg-canvas`, `border-hairline`, etc.).

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--canvas` | `#fafafa` | `#141415` | Main page background |
| `--canvas-soft` | `#f4f4f5` | `#0e0e0f` | Navbar, toolbar, modal header |
| `--canvas-soft-2` | `#e4e4e7` | `#1f1f22` | Input fields, chip backgrounds |
| `--ink` | `#171717` | `#ededed` | Primary text, headings |
| `--body` | `#4d4d4d` | `#a1a1a1` | Secondary / descriptive text |
| `--mute` | `#888888` | `#888888` | Placeholders, disabled states |
| `--hairline` | `#e4e4e7` | `#27272a` | Dividers, card borders |
| `--hairline-strong` | `#d4d4d8` | `#3f3f46` | Focused borders |
| `--primary` | `#171717` | `#ededed` | Active state, brand emphasis |
| `--on-primary` | `#ffffff` | `#000000` | Text on primary-colored surfaces |
| `--success` | `#0070f3` | `#3291ff` | Positive states, links |
| `--error` | `#ee0000` | `#ff4757` | Errors, destructive actions |
| `--warning` | `#f5a623` | `#f5a623` | Cautions, medium-severity gaps |

### Typography

| Family | Tailwind Class | Usage |
|---|---|---|
| Geist Sans | `font-sans` | All UI text, labels, body copy |
| Geist Mono | `font-mono` | Scores, dates, code, ATS tokens |

### Shadow Elevation

`Card.jsx` accepts an `elevation` prop (1–5) mapped to layered drop-shadow tokens.

| Level | Shadow Description | Typical Use Case |
|---|---|---|
| `1` | Subtle 2px lift, hairline ring | Secondary cards, list items |
| `2` | Medium 8px blur | Standard page cards |
| `3` | Deep 16px blur | Dialogs, dropdowns |
| `4` | Heavy 24px blur | Modals |
| `5` | Maximum 32px blur | Full-screen overlays |

Dark mode shadows use high-opacity black drops (`0.8`) layered with a 10% white top-edge highlight to create realistic depth on dark surfaces.

---

## Application Routing

Defined in [`App.jsx`](src/App.jsx):

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/login` | `Login.jsx` | No | Sign in |
| `/register` | `Register.jsx` | No | Create account |
| `/` | `Home.jsx` | **Yes** | Generate interview report |
| `/interview/:id` | `Interview.jsx` | **Yes** | Full interview report dashboard |
| `/interviews` | `InterviewsList.jsx` | **Yes** | All previous interview reports |

All protected routes are wrapped in `Protected.jsx` which reads `AuthContext` and redirects unauthenticated users to `/login`.

---

## Feature Modules

### Authentication

`features/auth/` handles all identity operations.

- **Login / Register**: Full-page forms with inline validation, error toasts, and a floating `ThemeToggle` button.
- **Protected.jsx**: Higher-order route wrapper. Renders `children` only when `AuthContext` has a valid user; otherwise pushes to `/login`.
- **AuthContext**: Stores `user` state fetched via `GET /api/auth/get-me` on mount. Exposes `login`, `register`, `logout` methods. Logout calls the API, clears state, and navigates to `/login`.

### Interview Dashboard

`features/interview/pages/Interview.jsx` is the primary workspace for a generated report. It is structured into three visual panes:

1. **Top Navigation** — Tab bar switching between: Questions, Prep Plan, Mock Interview
2. **Main Content Area** — Renders the active tab content (question cards with practice drawers, day-by-day plan, or the mock interview room)
3. **Right Sidebar** — Match Score ring (colored border based on score) and Skill Gap chips (color-coded by severity)

**QuestionCard** — Collapsible accordion per question. Expands to show model answer, STAR feedback, and a voice-dictation practice area.

### Resume Studio

`ResumeStudioModal.jsx` is a **full-screen takeover** (not a modal popup), accessible from the Interview Dashboard via the "Resume Studio" button.

**Toolbar:**
- **Format selector** — Switches between `classic`, `modern`, `minimal` PDF templates
- **Content Editor tab** — Dynamic form builder (`ResumeContentEditor.jsx`)
- **ATS Audit tab** — Keyword match visualization
- **Live Preview tab** — Renders the actual PDF inside an `<iframe>` using a blob Object URL

**ResumeContentEditor.jsx** sections (all fully dynamic — add/delete items):

| Section | Capabilities |
|---|---|
| Personal Info | Edit name, email, phone, location, LinkedIn, website |
| Professional Summary | Free-form textarea |
| Experience | Add/delete roles; editable role, company, dates, location; add/delete bullets per role |
| Projects | Add/delete projects; editable title, optional description, add/delete bullets |
| Education | Add/delete degrees; editable degree, institution, dates, details |
| Skills | Add/delete categories; editable category name; comma-separated items |
| Custom Sections | Add any number of arbitrary sections; editable heading; add/delete bullet points |

Empty sections (cleared or deleted) are omitted from the generated PDF automatically.

### Mock Interview Room

`MockInterviewRoom.jsx` provides a full turn-by-turn AI mock interview experience:

- **Text-to-Speech (TTS)**: `window.speechSynthesis` reads each question aloud
- **Speech-to-Text (STT)**: `window.SpeechRecognition` captures verbal candidate answers
- **Turn Loop**: Each turn sends the candidate's answer to `POST /api/interview/mock/:id/turn` and receives coaching feedback, score, and the next question
- **Final Scorecard**: When the AI concludes the session, displays Overall Score, Technical Rating, and Communication Rating

> **Browser Note:** Web Speech API requires Chrome or Edge. Firefox has limited support. The app degrades gracefully to text input when speech is unavailable.

---

## State Management & Context

| Context | File | Responsibility |
|---|---|---|
| `AuthContext` | `context/auth.context.jsx` | User session, login/logout/register |
| `ThemeContext` | `context/theme.context.jsx` | Dark/light mode toggle and persistence |
| `ToastContext` | `context/toast.context.jsx` | Global notification queue (success/error/info) |

All contexts follow the same pattern: a `Provider` component wraps the app in `App.jsx`, and a named hook (`useAuth`, `useTheme`, `useToast`) is exported for consumption.

---

## API Integration

All API calls are in `features/interview/services/interview.api.js` and `features/auth/services/auth.api.js`. Both use a pre-configured Axios instance with:

- `baseURL` set to `VITE_API_BASE_URL`
- `withCredentials: true` to include HTTP-only JWT cookies on every request

Key functions in `interview.api.js`:

| Function | Description |
|---|---|
| `generateResumePdf(id, resumeText, template, resumeData)` | Fetches PDF blob and triggers browser download |
| `getPreviewResumePdfUrl(id, template, resumeData)` | Fetches PDF blob and returns an Object URL for `<iframe>` preview |
| `getResumeStudioData(id)` | Fetches tailored resume JSON + ATS keyword data |
| `saveResumeStudioData(id, resumeData)` | Persists edited resume data to MongoDB |

---

## Component Library

All primitive UI components live in `src/components/ui/`:

### `Button.jsx`

```jsx
<Button variant="primary" | "outline" | "ghost" disabled={false}>
  Label
</Button>
```

### `Card.jsx`

```jsx
<Card elevation={1 | 2 | 3 | 4 | 5} padding="sm" | "md" | "lg" | "xl" | "none">
  Content
</Card>
```

### `Input.jsx`

```jsx
<Input label="Email" type="email" error="Required" value={val} onChange={fn} />
```

### `ThemeToggle.jsx`

Self-contained button. No props required. Reads and mutates `ThemeContext`.

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Start dev server with HMR at `localhost:5173` |
| `npm run build` | `vite build` | Production build to `dist/` |
| `npm run preview` | `vite preview` | Serve production build locally for verification |
| `npm run lint` | `eslint .` | Run ESLint across all source files |
