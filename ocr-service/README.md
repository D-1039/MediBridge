# MediBridge OCR Service

FastAPI microservice that performs CPU-only English OCR with PaddleOCR for medicine label images.

## Local Setup

```bash
cd ocr-service
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Start this service before starting the Node backend. The backend startup log only shows the configured OCR URL; it does not start or verify this process. Check `http://localhost:8000/health` before using the medicine OCR endpoints. When the service is stopped, the backend returns `503 OCR_UNAVAILABLE` rather than a successful response containing an error.

The service loads `PaddleOCR(use_angle_cls=True, lang="en", use_gpu=False)` once when the application starts. The backend connects to it through `OCR_SERVICE_URL`, which defaults to `http://localhost:8000`.

## Endpoints

### `GET /health`

Returns a small health response with `status` and `source`.

### `POST /ocr`

Accepts an image upload in the multipart field `image`. The response contains:

- `rawText` - recognized text joined by lines.
- `ocrConfidence` - average recognition confidence.
- `source` - always `paddleocr`.
- `medicalMetadata` - suggested `expiry`, `batchNumber`, and `dosages` values parsed with regular expressions.
- `words` - recognized line text and confidence values.
- `batchNumberConfidence` - confidence from the OCR line used for the extracted batch number.
- `batchNumberNeedsReview` - true when the batch confidence is below the `0.90` review threshold.

Batch number extraction has an inherent accuracy ceiling: dense alphanumeric label text can cause PaddleOCR to substitute or drop characters, and a regular expression cannot recover a character that OCR never recognized. The confidence flag makes this uncertainty visible so the user can verify the strip or retake a close, well-lit photo. Other extracted fields are not flagged by this batch-specific rule.

The endpoint returns `400` for non-image or invalid image files and `422` when no text is detected. Medical metadata is a suggestion for the editable intake form; it is not authoritative medical data.

## Dependencies

Python dependencies and pinned versions are in `requirements.txt`: FastAPI, Uvicorn, PaddlePaddle, PaddleOCR, python-multipart, Pillow, and NumPy.

The included `Dockerfile` uses Python 3.10 slim, installs the system libraries required by PaddleOCR, installs the requirements, and initializes the English OCR model during the image build. The local Python command above is the development entry point. Docker is optional for local development; if it is used, expose the service with `-p 8000:8000`.
