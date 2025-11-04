# AQITracker

AQITracker is a production-ready web experience that delivers real-time air quality intelligence for major
cities across the globe. The project ships as a modern full-stack application with a FastAPI backend that
proxies OpenAQ data sources and a polished React (Vite) frontend styled with Tailwind CSS and motion accents.

## Features

- **Responsive design:** premium glassmorphism aesthetic, dark/light theme toggle, and mobile-first layout.
- **City catalog:** curated list of high-population cities with reliable sensor coverage.
- **Live AQI insights:** current index, pollutant breakdown, and health guidance generated from authoritative
  breakpoints.
- **Trend analytics:** interactive 24-hour AQI area chart and contextual highlights for fast scanning.
- **Resilient data layer:** automatic fallback dataset keeps the UI informative if third-party APIs are
  temporarily unavailable.

## Project structure

```
.
├── backend/            # FastAPI service (uvicorn entrypoint `app.main`)
├── frontend/           # Vite + React + Tailwind single-page application
└── README.md
```

## Getting started

1. **Install dependencies**

   ```bash
   # Backend
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Run the development servers**

   ```bash
   # Start backend on http://localhost:8000
   cd backend
   uvicorn app.main:app --reload

   # Start frontend (uses Vite proxy to backend)
   cd frontend
   npm run dev
   ```

   The React app will be served from [http://localhost:5173](http://localhost:5173) and automatically proxy API
   requests to the FastAPI service.

3. **Build for production**

   ```bash
   # Frontend static build
   cd frontend
   npm run build

   # Optional: run FastAPI with production server
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Deployment notes

- Environment variable `VITE_API_BASE_URL` can be defined when building the frontend to point to a deployed API
  instance. In local development the Vite dev server proxies `/api` routes automatically.
- The backend depends on the public [OpenAQ API](https://docs.openaq.org/). Ensure outbound HTTPS access is
  allowed in your hosting environment. If the API is unreachable, AQITracker returns curated fallback insights
  so the user interface remains functional.
- Both backend and frontend are framework-agnostic and can be containerised. For example, deploy FastAPI via
  Uvicorn/Gunicorn and serve the `frontend/dist` folder via any static host (e.g., Netlify, Cloudflare Pages,
  or an Nginx container).

## API summary

- `GET /health` – Health check for monitoring and orchestration.
- `GET /api/cities` – Returns the curated list of supported cities.
- `GET /api/aqi/current?city=Delhi` – Returns current AQI insight payload containing pollutants, trend data,
  and recommendations.

## Accessibility & performance

- Uses semantic HTML, large tap targets, and accessible contrast levels.
- Tailwind + Vite ensures small, tree-shaken bundles for fast load times.
- Framer Motion adds subtle motion without compromising Core Web Vitals.

## License

This project is provided without an explicit license and is intended for internal or evaluation use. Extend it
freely for your deployments as needed.
