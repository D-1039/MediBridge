# MediBridge – Smart Medicine Redistribution & Waste Tracking System

A modern healthcare hackathon MVP for reducing medicine wastage and redistributing unused medicines safely to needy patients.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI** (Radix primitives)
- **Framer Motion**
- **Recharts**
- **Lucide React**

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login (demo — redirects to dashboard) |
| `/dashboard` | Admin dashboard with charts & tables |
| `/dashboard/upload` | Medicine donation upload with OCR simulation |
| `/dashboard/requests` | Medicine requests with filters |
| `/dashboard/verification` | Pharmacist verification queue |

## Features

- Dark/light mode toggle
- Animated statistics counters
- Glassmorphism UI
- Drag-and-drop medicine upload
- OCR processing animation
- Toast notifications (Sonner)
- Responsive mobile navigation
- Recharts visualizations

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # UI, landing, dashboard, upload, etc.
│   ├── hooks/            # useCounter, useInView
│   ├── services/         # Mock data
│   └── utils/            # Format helpers
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Full stack (frontend + API)

The UI is connected to the Express API in `backend/`.

### 1. Backend

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL (Neon/local Postgres). For local dev without GCP:
#   DEV_OCR_FALLBACK=true
#   USE_LOCAL_STORAGE=true
npm install
npm run migrate
npm run seed
npm run dev
```

API: http://localhost:5000/api

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # or use the included .env.local
npm install
npm run dev
```

Open http://localhost:3000 → **Login** with:

| Role | Email | Password |
|------|-------|----------|
| Donor | donor@medibridge.health | password123 |
| Pharmacist | pharmacist@medibridge.health | password123 |
| Admin | admin@medibridge.health | password123 |

### Google Vision OCR (production)

1. Enable Cloud Vision API in GCP.
2. Add `service-account-vision.json` or set `GCP_VISION_CLIENT_EMAIL` + `GCP_VISION_PRIVATE_KEY` in `backend/.env`.
3. Set `DEV_OCR_FALLBACK=false`.

Medicine upload runs: **image → storage → Vision OCR → parser → pharmacist queue**.

Landing/marketing pages still use static chart samples; dashboard and workflows use live API data.
