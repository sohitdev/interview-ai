# Interview AI — Frontend

React 19 + Vite 6 + Tailwind CSS v4 SPA for the Interview AI platform.

## Stack

- **React 19** — UI library
- **Vite 6** — Build tool and dev server
- **Tailwind CSS v4** — Utility-first styling via `@theme` CSS variable tokens
- **Framer Motion** — Entrance animations and layout transitions
- **React Router** — Client-side routing
- **Axios** — HTTP client for backend API calls
- **@phosphor-icons/react** — Icon system
- **Geist** — `Geist Sans` and `Geist Mono` font system

## Quick Start

```bash
npm install
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:3000
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Backend Express API base URL |

## Design System

The entire design system lives in [`src/index.css`](src/index.css):

- **CSS variables** defined in `:root` (light mode) and `.dark` (dark mode)
- **Tailwind `@theme`** maps those variables to Tailwind utility classes (`text-ink`, `bg-canvas`, etc.)
- **Dark mode** toggled by adding the `.dark` class to `<html>`, managed by `ThemeContext`

### Color Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--canvas` | `#fafafa` | `#141415` | Page background |
| `--canvas-soft` | `#f4f4f5` | `#0e0e0f` | Navbar, toolbar backgrounds |
| `--canvas-soft-2` | `#e4e4e7` | `#1f1f22` | Input backgrounds, chips |
| `--ink` | `#171717` | `#ededed` | Primary text |
| `--body` | `#4d4d4d` | `#a1a1a1` | Secondary text |
| `--mute` | `#888888` | `#888888` | Placeholder / disabled text |
| `--hairline` | `#e4e4e7` | `#27272a` | Borders |
| `--primary` | `#171717` | `#ededed` | Active/brand color |

### Shadow Elevation

Cards use an `elevation` prop (1–5) mapped to CSS shadow tokens:

| Level | Usage |
|---|---|
| `1` | Subtle lift |
| `2` | Standard card |
| `3` | Modal header |
| `4` | Dropdown / popover |
| `5` | Full-screen overlay |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
