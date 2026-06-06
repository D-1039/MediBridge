# MediBridge Backend API

Production-ready Node.js/Express API for the MediBridge medicine redistribution platform.

**Frontend is separate** — this package provides integration-ready REST endpoints only.

## Architecture

```
Frontend → Express API → Firebase Storage → Google Vision OCR
         → Medicine Parser → Safety Engine → PostgreSQL → Pharmacist Verification
         → Marketplace → Receiver Requests → Audit Logs
```

## Quick Start

```bash
cd backend
cp .env.example .env
# Fill DATABASE_URL, Firebase, and GCP Vision credentials
npm install
npm run migrate
npm run dev
```

- API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/api/docs`
- Health: `http://localhost:5000/api/health`

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login + JWT |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Public | Revoke refresh token |
| GET | `/api/auth/me` | Auth | Current user profile |
| POST | `/api/medicines/upload` | Donor | Upload image → Firebase → OCR |
| GET | `/api/medicines` | Public | Approved marketplace list |
| GET | `/api/medicines/:id` | Public | Approved medicine detail |
| GET | `/api/medicines/donor/my` | Donor | Donor's uploads |
| GET | `/api/pharmacist/pending` | Pharmacist | Pending verification queue |
| GET | `/api/pharmacist/medicine/:id` | Pharmacist | Medicine + audit trail |
| PUT | `/api/pharmacist/approve/:id` | Pharmacist | Approve medicine |
| PUT | `/api/pharmacist/reject/:id` | Pharmacist | Reject medicine |
| PUT | `/api/pharmacist/manual-review/:id` | Pharmacist | Send to manual review |
| POST | `/api/requests` | Receiver | Request approved medicine |
| GET | `/api/requests/my` | Receiver | My requests |
| PUT | `/api/requests/:id/approve` | Pharmacist/Donor/Admin | Approve request |
| PUT | `/api/requests/:id/complete` | Pharmacist/Donor/Admin | Mark distributed |
| PUT | `/api/requests/:id/reject` | Pharmacist/Admin | Reject request |
| GET | `/api/analytics/dashboard` | Auth | Platform statistics |

## Medicine Upload Flow

1. Donor sends `multipart/form-data` with field `image`
2. Image uploaded to **Firebase Storage** (URL saved in DB only)
3. **Google Vision OCR** extracts text + confidence
4. **Parser** extracts name, dosage, batch, expiry, quantity
5. **Safety engine** validates expiry, batch, OCR confidence
6. Status set to `pending_pharmacist` or `manual_review`
7. Pharmacist has **final authority** for approve/reject

## Frontend Integration

```javascript
// Login
const res = await fetch(`${API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { data } = await res.json();
localStorage.setItem("accessToken", data.accessToken);

// Upload medicine
const form = new FormData();
form.append("image", file);
form.append("quantity", "10");
await fetch(`${API_URL}/api/medicines/upload`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form,
});
```

## Environment Variables

See `.env.example` for the full list.

## Deployment

### Render (API)

1. Create Web Service from this `backend/` directory
2. Set `DATABASE_URL` from Neon
3. Add Firebase + GCP credentials as env vars
4. Use `render.yaml` or set start: `npm run migrate && npm start`

### Neon PostgreSQL

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string to `DATABASE_URL`
3. Run `npm run migrate`

### Firebase Storage

1. Enable Storage in Firebase Console
2. Create service account → download JSON
3. Set `FIREBASE_*` env vars

### Google Cloud Vision

1. Enable Vision API
2. Create service account with Vision User role
3. Set `GOOGLE_APPLICATION_CREDENTIALS` path or inline credentials

## Production Checklist

- [ ] Strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Neon `DATABASE_URL` with SSL
- [ ] Firebase bucket rules secured
- [ ] CORS limited to production frontend URL
- [ ] Rate limits tuned for traffic
- [ ] GCP billing alerts enabled
- [ ] Run migrations on deploy
- [ ] Health check `/api/health` monitored

## Tests

```bash
npm test
```

## Project Structure

```
backend/
├── src/
│   ├── config/       # DB, Firebase, Vision, JWT
│   ├── controllers/  # HTTP handlers
│   ├── routes/       # Express routers
│   ├── middleware/   # Auth, validation, errors
│   ├── services/     # Business logic
│   ├── repositories/ # PostgreSQL access
│   ├── validators/   # express-validator rules
│   ├── utils/        # Parser, safety score, errors
│   ├── docs/         # Swagger
│   └── app.js
├── migrations/       # SQL schema
├── __tests__/        # Unit + integration tests
└── server.js
```
