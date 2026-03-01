# PasteDrop Frontend

A production-quality React + Vite frontend for the PasteDrop pastebin service.

## Stack

- **React 18** — UI
- **Vite** — build tool & dev server
- **React Router v6** — client-side routing
- **Axios** — HTTP client
- **JetBrains Mono + Syne** — typography (via Google Fonts)
- Plain CSS — no framework, custom design system

---

## Project Structure

```
pastebin-frontend/
├── index.html
├── vite.config.js
├── package.json
├── .env                   ← API base URL (not committed to git)
├── .env.example           ← template for environment setup
└── src/
    ├── main.jsx           ← entry point
    ├── App.jsx            ← router setup
    ├── index.css          ← global styles / design tokens
    ├── services/
    │   └── api.js         ← Axios instance + all API calls
    └── pages/
        ├── Home.jsx       ← Create Paste (route: /)
        └── ViewPaste.jsx  ← View + Delete Paste (route: /paste/:keyID)
```

---

## Setup & Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The `.env` file already contains the correct API URL:

```
VITE_API_BASE_URL=https://3euanx6rsc.execute-api.ap-south-1.amazonaws.com/prod
```

Change only if your backend URL changes.

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Production Build

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Deploying

### Vercel
```bash
npx vercel
```
Set `VITE_API_BASE_URL` as an environment variable in the Vercel dashboard.

### AWS S3 + CloudFront
1. Run `npm run build`
2. Upload `dist/` to an S3 bucket (static website hosting enabled)
3. Add a CloudFront distribution
4. For React Router to work: set the error page (403/404) to `index.html` with status 200

### Netlify
```bash
npx netlify deploy --prod --dir=dist
```
Add `VITE_API_BASE_URL` in Netlify environment settings.
Add a `_redirects` file in `public/`:
```
/* /index.html 200
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API (no trailing slash) |

> All Vite env variables must be prefixed with `VITE_` to be accessible in the browser.
