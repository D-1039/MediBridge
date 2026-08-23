# MediBridge

MediBridge is a medicine redistribution application with a Next.js frontend, an Express/PostgreSQL API, and a local PaddleOCR microservice. OCR output is treated as an editable suggestion; donor-entered medicine fields and pharmacist verification remain authoritative.

## Repository Layout

- `frontend/` - Next.js 15 App Router application using TypeScript, Tailwind CSS, Radix UI, Framer Motion, Recharts, and Lucide React.
- `backend/` - Node.js 18+ Express API, PostgreSQL repositories/migrations, Firebase image storage integration, authentication, requests, analytics, and pharmacist workflows.
- `ocr-service/` - Python 3.10 FastAPI service using PaddleOCR in CPU mode.

There is no root package manifest. Install and run each service from its own directory.

## Local Setup

Open three terminals and start the services in this order: database, OCR service, backend, then frontend.

### 1. Database

```bash
cd backend
npm install
npm run db:start
```

Keep the embedded PostgreSQL helper running.

### 2. OCR service

```bash
cd ocr-service
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

The service exposes `GET /health` and `POST /ocr`. The OCR endpoint accepts an image multipart field named `image` and returns recognized text, confidence, word results, and medical field suggestions for expiry, batch/lot number, and dosage. Invalid image files return `400`; images with no detected text return `422`.

The included `ocr-service/Dockerfile` installs the required system libraries and preloads the English PaddleOCR model during image build.

### 3. Backend API

Create `backend/.env` from `backend/.env.example`, then set at least `DATABASE_URL`, JWT secrets, and the local OCR URL. `USE_LOCAL_STORAGE=true` allows local image storage when Firebase is not configured during development.

```bash
cd backend
npm run migrate
npm run seed
npm run dev
```

The API runs at `http://localhost:5000/api`. The OCR client uses `OCR_SERVICE_URL=http://localhost:8000` by default.

Useful backend scripts:

- `npm test` - run the Jest unit and integration tests.
- `npm run test:watch` - run Jest in watch mode.
- `npm run check-ocr [image]` - call the configured OCR service with an optional image.
- `npm run db:start` - start the embedded development PostgreSQL helper.
- `npm run migrate:down` - roll back migrations.
- `npm run seed` - seed demo users.

### 4. Frontend

```bash
cd frontend
npm install
# Copy .env.local.example to .env.local if a different API URL is needed
npm run dev
```

The frontend runs at `http://localhost:3000` and uses `NEXT_PUBLIC_API_URL` for the backend base URL. It includes landing, about, feature, login, upload, dashboard, requests, verification, and admin views under `frontend/src/app/`.

Demo seed users are `donor@medibridge.health`, `pharmacist@medibridge.health`, and `admin@medibridge.health`, all with password `password123`.

## Main API Areas

The backend provides authentication, medicine upload and OCR suggestions, inventory search, donor listings, pharmacist verification, receiver requests, admin views, analytics, and health checks. Swagger is available locally at `http://localhost:5000/api/docs` when the backend is running.

Medicine uploads use `multipart/form-data`. OCR suggestions are available through `/api/medicines/ocr-suggest` and `/api/medicines/ocr-suggest-multi`; the upload flow does not automatically apply OCR expiry, batch, or dosage values to the database.

The Suggested Details panel keeps Medicine Name, MFD, and Expiry neutral when their OCR values are available. A batch result below the OCR service's `0.90` confidence threshold is shown with an amber warning, is not silently accepted into the form, and offers a `Retake Photo` action. Submission remains optional and requires the user to verify the batch number manually.

## Tests

Backend tests are in `backend/__tests__/` and cover parsing, safety scoring, and basic API behavior. Frontend checks are provided by its Next.js build and ESLint configuration.
