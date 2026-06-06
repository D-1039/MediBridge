const { preprocessForOcr } = require("./imagePreprocess");
const { AppError } = require("../utils/errors");

/**
 * Google Vision REST API using API key (simplest setup after enabling Vision API).
 */
async function runVisionOcrWithApiKey(buffer) {
  const { getApiKey } = require("../config/vision");
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new AppError(
      "Google Vision API key missing. Add backend/google-vision-api-key.txt or GOOGLE_VISION_API_KEY in .env",
      503,
      "VISION_NOT_CONFIGURED"
    );
  }

  const processed = await preprocessForOcr(buffer);
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey.trim())}`;

  const body = {
    requests: [
      {
        image: { content: processed.toString("base64") },
        features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
        imageContext: { languageHints: ["en"] },
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new AppError(`Vision API error: ${msg}`, res.status, "VISION_API_ERROR");
  }

  const annotation = data.responses?.[0]?.fullTextAnnotation;
  const rawText = annotation?.text?.trim() || "";

  if (!rawText) {
    throw new AppError(
      "No text detected on the medicine image. Use a clear photo of the label.",
      422,
      "OCR_NO_TEXT"
    );
  }

  let confidenceSum = 0;
  let confidenceCount = 0;
  for (const page of annotation?.pages || []) {
    for (const block of page.blocks || []) {
      if (block.confidence != null) {
        confidenceSum += block.confidence;
        confidenceCount += 1;
      }
    }
  }

  const ocrConfidence =
    confidenceCount > 0
      ? Math.round((confidenceSum / confidenceCount) * 10000) / 10000
      : rawText.length > 20
        ? 0.78
        : 0.5;

  return { rawText, ocrConfidence, source: "google_vision_api_key" };
}

module.exports = { runVisionOcrWithApiKey };
