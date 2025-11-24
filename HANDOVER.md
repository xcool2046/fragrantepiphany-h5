# Project Handover Document: Fragrant Epiphany (Frontend Refactor)

## 1. Project Status
- **Frontend**: Completely refactored using **Vite + React + TypeScript**.
- **Design**: Implemented "Warm Apricot" light theme with premium "Dark Gold" accents.
- **Deployment**: Switched to **Nginx Static Serving** (no longer building frontend in Docker).
- **Progress**: 95% Complete (Core flows working, API integrated, i18n done).

## 2. Key Features Implemented
- **Internationalization (i18n)**: Full English/Chinese support with auto-detection.
- **Draw Page (Redesigned)**:
    - **Layout**: Left Info / Right Vertical Wheel.
    - **Interaction**: Infinite scrolling loop, 3D "fan" animation.
    - **Visuals**: CSS-based "Dark Gold" card back (no images required).
- **API Integration**:
    - `Question.tsx`: Submits questionnaire data.
    - `Result.tsx`: Fetches interpretation data (with local fallback).
- **Deployment**:
    - `docker-compose.yml`: Mounts `frontend/dist` to Nginx.
    - `nginx.conf`: Serves static files and proxies `/api` to backend.

## 3. Directory Structure (Core)
```
/home/code/h5-web/
├── docker-compose.yml      # Orchestration (Nginx + Backend + DB)
├── nginx.conf              # Static serving + API Proxy
├── frontend/               # [NEW] Vite Project
│   ├── dist/               # Production build assets
│   ├── src/
│   │   ├── api.ts          # Axios client
│   │   ├── i18n.ts         # i18next config
│   │   ├── pages/
│   │   │   ├── Home.tsx    # Landing page
│   │   │   ├── Draw.tsx    # Infinite Card Wheel
│   │   │   ├── Question.tsx# Questionnaire
│   │   │   └── Result.tsx  # Interpretation & API
│   │   ├── locales/        # en.json, zh.json
│   │   └── index.css       # Tailwind + Custom CSS
│   └── vite.config.ts      # Proxy config for local dev
└── backend/                # Existing Node.js backend
```

## 4. Known Issues & Next Steps
- **Payment Integration**: The "Unlock" button in `Result.tsx` is UI-only.
- **Constraint**: **Focus strictly on Frontend**. Do not debug or modify Backend/Docker configurations unless explicitly requested. Assume Backend is working as intended.

## 5. How to Run
- **Development**:
  ```bash
  cd frontend
  npm run dev  # Localhost:5173 (Hot Reload)
  ```
- **Production (Simulation)**:
  ```bash
  cd frontend && npm run build
  cd ..
  docker-compose up -d --remove-orphans
  # Access at http://localhost:8080
  ```
