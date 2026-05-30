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
src/
├── app/              # Next.js App Router pages
├── components/       # UI, landing, dashboard, upload, etc.
├── hooks/            # useCounter, useInView
├── services/         # Mock data
└── utils/            # Format helpers
```

## Note

This is a **frontend-only MVP** with static/dummy data. No backend or authentication is implemented.
