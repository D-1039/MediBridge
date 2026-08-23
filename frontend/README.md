# MediBridge Frontend

Next.js 15 App Router frontend for the MediBridge medicine redistribution application.

## Local Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The development server runs at `http://localhost:3000` by default. Set `NEXT_PUBLIC_API_URL` in `.env.local` when the backend runs at a different URL. The default backend URL is `http://localhost:5000`.

The frontend expects the backend API and PaddleOCR service to be running separately. See the repository README and `../ocr-service/README.md` for the local full-stack setup.

## Scripts

- `npm run dev` - start the Next.js development server.
- `npm run build` - create a production build locally.
- `npm start` - serve the built Next.js application locally.
- `npm run lint` - run the configured lint command.

## Routes

- `/` - landing page.
- `/about` - about page.
- `/features` - feature overview.
- `/login` - login screen.
- `/dashboard` - dashboard overview.
- `/dashboard/upload` - medicine donation upload and OCR suggestion flow.
- `/dashboard/requests` - medicine request management.
- `/dashboard/verification` - pharmacist verification queue.
- `/dashboard/admin` - admin dashboard.
- `/dashboard/pharmacist` - pharmacist dashboard.

## Technology

The project uses TypeScript, React 19, Next.js, Tailwind CSS, Radix UI primitives, Framer Motion, Recharts, Lucide React, Sonner, and React Easy Crop. Shared UI components are under `src/components/ui/`; application pages are under `src/app/`.

The upload form's Suggested Details panel displays PaddleOCR suggestions as editable values. Medicine Name, Manufacturing Date, and Expiry Date use the normal suggestion presentation. Batch Number includes `batchNumberConfidence`; when it is below `0.90`, the field is amber, shows a manual-verification prompt, is excluded from automatic suggestion acceptance, and provides `Retake Photo` through the existing image picker. This warning does not block submission.

## Structure

```text
frontend/
├── src/
│   ├── app/           # App Router pages and layouts
│   ├── components/   # UI, dashboard, upload, landing, and role views
│   ├── contexts/      # React application contexts
│   ├── hooks/         # Shared React hooks
│   ├── lib/           # API client and shared libraries
│   ├── services/      # Frontend service helpers
│   ├── types/         # TypeScript types
│   └── utils/         # Shared utility functions
├── public/            # Static assets, when present
├── package.json       # Scripts and dependencies
├── next.config.ts     # Next.js configuration
├── tsconfig.json      # TypeScript configuration
└── .env.local.example # Local frontend environment template
```
