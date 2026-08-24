# MediBridge Backend

Node.js 18+ and Express API for MediBridge. The backend owns authentication, PostgreSQL access, medicine intake, OCR coordination, inventory search, pharmacist verification, receiver requests, analytics, and audit logs.

## Local Setup

Create `backend/.env` from `.env.example`. Configure `DATABASE_URL`, JWT secrets, Firebase settings if remote image storage is desired, and `OCR_SERVICE_URL` for the sibling OCR service. With `USE_LOCAL_STORAGE=true`, development can store uploads locally when Firebase is not configured.

Start the sibling OCR service first from `ocr-service/`:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

If OCR requests report `OCR service unavailable: fetch failed`, start the Python service separately and verify `http://localhost:8000/health`. The Node startup message only displays the configured URL; it does not start or probe the OCR service. On this local setup, the failure was caused by the OCR service not running; both `localhost:8000` and `127.0.0.1:8000` refused connections.

Then run the API:

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

The API listens on port `5000` by default. Local URLs are `http://localhost:5000/api`, `http://localhost:5000/api/health`, and `http://localhost:5000/api/docs`.

## Scripts

- `npm start` - start `server.js`.
- `npm run dev` - start the API with nodemon.
- `npm run dev:clean` - stop port 5000 with the included PowerShell helper, then start nodemon.
- `npm run migrate` and `npm run migrate:down` - apply or roll back database migrations.
- `npm run db:start` - start the embedded PostgreSQL development helper.
- `npm run seed` - create demo users.
- `npm run check-ocr [image]` - check OCR configuration or process an image.
- `npm run check-vision [image]` - legacy-named diagnostic script that now uses the configured OCR boundary.
- `npm test` and `npm run test:watch` - run Jest.

## OCR

`src/services/ocrClient.js` sends image buffers to `${OCR_SERVICE_URL}/ocr` using native Node 18 `fetch`, `FormData`, and `Blob`. The default URL is `http://localhost:8000`.

The active OCR source is the sibling PaddleOCR service. Its response includes `rawText`, `ocrConfidence`, `source`, `medicalMetadata`, `words`, `batchNumberConfidence`, and `batchNumberNeedsReview`. Batch numbers can contain dense alphanumeric characters that OCR misreads, so values below the `0.90` threshold are flagged for manual verification. Network failures map to `503`, no detected text passes through as `422`, and other OCR service failures map to `502`.

`/api/medicines/ocr-suggest` and `/api/medicines/ocr-suggest-multi` expose OCR values as editable suggestions. Upload persistence uses the fields submitted by the donor; OCR does not silently overwrite expiry, batch number, or dosage.

The frontend highlights a flagged batch number in amber and preserves it on submission with `batch_number_verified=false`; it also offers a close-up `Retake Photo` action. Medicine Name, manufacturing date, and expiry date are not batch-confidence flagged.

## API Areas

- `/api/auth` - registration, login, refresh, logout, and current-user details.
- `/api/medicines` - upload, OCR suggestions, donor medicines, inventory search, and approved medicine listing.
- `/api/pharmacist` - pending queue, medicine details, statistics, approval, rejection, and manual review.
- `/api/requests` - receiver requests and pharmacist/donor/admin request actions.
- `/api/admin` - overview, analytics, medicine details, and recent activity.
- `/api/analytics` - dashboard analytics.
- `/api/health` - API and OCR configuration health information.

## Environment Variables

The complete local example is in `.env.example`. The main variables are `NODE_ENV`, `PORT`, `API_BASE_URL`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `CORS_ORIGINS`, Firebase settings, `OCR_SERVICE_URL`, `USE_LOCAL_STORAGE`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `SAFETY_LOW_OCR_THRESHOLD`, and `SAFETY_EXPIRY_WARNING_DAYS`.

## Structure

```text
backend/
├── src/
│   ├── config/          # Database, Firebase, JWT, OCR, and Vision configuration
│   ├── controllers/     # HTTP handlers
│   ├── routes/           # Express route modules
│   ├── middleware/       # Authentication, uploads, validation, and errors
│   ├── services/         # OCR client, business logic, storage, and audit services
│   ├── repositories/     # PostgreSQL access
│   ├── validators/       # Request validation
│   ├── utils/            # Parsing, safety, response, and error helpers
│   ├── docs/             # Swagger configuration and paths
│   └── app.js            # Express application
├── migrations/           # SQL schema migrations
├── scripts/              # Development, seed, OCR, and database utilities
├── __tests__/            # Unit and integration tests
└── server.js             # Local API entry point
```

The backend package dependencies are declared in `package.json`; notably, OCR is not a Node package dependency. The Python dependencies for PaddleOCR are declared in `../ocr-service/requirements.txt`.
