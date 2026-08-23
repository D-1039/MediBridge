const { AppError } = require("../utils/errors");

const OCR_SERVICE_URL = (process.env.OCR_SERVICE_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);

async function runPaddleOcr(buffer) {
  if (!buffer?.length) {
    throw new AppError("Image data is empty", 400, "OCR_INVALID_IMAGE");
  }

  const form = new FormData();
  form.append("image", new Blob([buffer], { type: "image/jpeg" }), "medicine-image.jpg");

  let response;
  try {
    response = await fetch(`${OCR_SERVICE_URL}/ocr`, { method: "POST", body: form });
  } catch (err) {
    throw new AppError(`OCR service unavailable: ${err.message}`, 503, "OCR_UNAVAILABLE");
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.detail || payload.message || `OCR service returned ${response.status}`;
    if (response.status === 422) {
      throw new AppError(message, 422, "OCR_NO_TEXT");
    }
    throw new AppError(message, 502, "OCR_FAILED");
  }

  return {
    rawText: payload.rawText || "",
    ocrConfidence: payload.ocrConfidence ?? null,
    source: payload.source || "paddleocr",
    medicalMetadata: payload.medicalMetadata || {
      expiry: null,
      batchNumber: null,
      dosages: [],
    },
  };
}

module.exports = { runPaddleOcr };
