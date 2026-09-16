# Interview AI Frontend

React and Vite client for the Interview AI platform. Users can register, sign in, upload a PDF resume, generate an interview report, review preparation content, and download an AI-tailored resume PDF.

## Requirements

- Node.js 20 or newer
- The backend running locally or a deployed backend URL

## Setup

From this directory:

```bash
npm install
cp .env.example .env.local
npm run dev
```

The development server runs at `http://localhost:5173` by default.

## Environment variables

Create `frontend/.env.local` from `.env.example`:

| Variable            | Required | Description                                         |
| ------------------- | -------- | --------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | Backend origin, for example `http://localhost:3000` |

Only variables prefixed with `VITE_` are exposed to browser code. Never put database credentials, JWT secrets, Gemini keys, or other private values in this file.

## Scripts

| Command           | Purpose                                 |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start Vite with hot reload              |
| `npm run build`   | Create the production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally     |
| `npm run lint`    | Run ESLint                              |

## Application routes

- `/login` - sign in
- `/register` - create an account
- `/` - authenticated report dashboard
- `/interview/:interviewId` - authenticated interview report

The client uses cookie credentials for authentication. The backend must allow the frontend origin through CORS.

## Production deployment

1. Set `VITE_API_BASE_URL` to the public backend origin before building.
2. Run `npm run build`.
3. Serve `dist/` from a static host or CDN.
4. Configure the backend `CLIENT_URL` to the deployed frontend origin.
5. Serve the application over HTTPS so authentication cookies and API traffic are protected in transit.

## Project structure

```text
src/
	features/
		auth/       Authentication pages, context, hooks, and API client
		interview/  Report generation, report views, PDF download, and styles
	App.jsx       Application routes and providers
	main.jsx      Browser entry point
```

## Security notes

- Do not commit `.env`, `.env.local`, or generated build output.
- Do not expose backend secrets through `VITE_` variables.
- The frontend assumes the backend validates ownership of every report requested for PDF generation.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
