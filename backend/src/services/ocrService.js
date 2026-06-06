const https = require("https");
const http = require("http");
const {
  getVisionClient,
  getVisionConfigError,
  hasApiKey,
  isVisionConfigured,
} = require("../config/vision");
const { getOcrEnginePreference } = require("../config/ocr");
const { preprocessForOcr } = require("./imagePreprocess");
const { runVisionOcrWithApiKey } = require("./visionApiKey");
const { runTesseractOcr } = require("./tesseractOcr");
const { AppError } = require("../utils/errors");

function fetchImageBuffer(imageUrl) {
  return new Promise((resolve, reject) => {
    const client = imageUrl.startsWith("https") ? https : http;
    client
      .get(imageUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchImageBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new AppError(`Failed to fetch image: ${res.statusCode}`, 400));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function computeConfidence(annotation) {
  const rawText = annotation?.text || "";
  const pages = annotation?.pages || [];

  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const page of pages) {
    for (const block of page.blocks || []) {
      if (block.confidence != null) {
        confidenceSum += block.confidence;
        confidenceCount += 1;
      }
    }
  }

  if (confidenceCount > 0) {
    return Math.round((confidenceSum / confidenceCount) * 10000) / 10000;
  }

  if (rawText.length > 40) return 0.82;
  if (rawText.length > 15) return 0.68;
  return 0.45;
}

function isBillingOrQuotaError(message) {
  return /billing|BILLING_DISABLED|enable billing|quota|RESOURCE_EXHAUSTED/i.test(
    message || ""
  );
}

async function runVisionOcrWithServiceAccount(buffer) {
  const visionClient = getVisionClient();
  const processed = await preprocessForOcr(buffer);

  const request = {
    image: { content: processed },
    imageContext: { languageHints: ["en"] },
  };

  let annotation = null;

  try {
    const [docResult] = await visionClient.documentTextDetection(request);
    annotation = docResult.fullTextAnnotation;
  } catch (docErr) {
    console.warn("documentTextDetection failed, trying textDetection:", docErr.message);
  }

  if (!annotation?.text?.trim()) {
    const [textResult] = await visionClient.textDetection(request);
    annotation = textResult.fullTextAnnotation;
  }

  const rawText = annotation?.text?.trim() || "";
  if (!rawText) {
    throw new AppError(
      "No text detected on the medicine image. Use a clear, well-lit photo of the label.",
      422,
      "OCR_NO_TEXT"
    );
  }

  return {
    rawText,
    ocrConfidence: computeConfidence(annotation),
    source: "google_vision",
  };
}

async function runVisionOcr(buffer) {
  if (hasApiKey()) {
    return runVisionOcrWithApiKey(buffer);
  }
  return runVisionOcrWithServiceAccount(buffer);
}

async function extractTextFromImage(imageUrl, imageBuffer = null) {
  const preference = getOcrEnginePreference();

  if (preference === "tesseract") {
    return runTesseractFromBuffer(imageUrl, imageBuffer);
  }

  if (preference === "google_vision") {
    const configError = getVisionConfigError();
    if (configError) {
      throw new AppError(configError, 503, "VISION_NOT_CONFIGURED");
    }
    return runVisionFromBuffer(imageUrl, imageBuffer);
  }

  if (isVisionConfigured()) {
    try {
      return await runVisionFromBuffer(imageUrl, imageBuffer);
    } catch (err) {
      const msg = err.message || "";
      if (isBillingOrQuotaError(msg)) {
        console.warn("Google Vision blocked (billing/quota). Using free local OCR.");
        return runTesseractFromBuffer(imageUrl, imageBuffer);
      }
      if (err.isOperational) throw err;
      if (/credential|authentication|403|401|API key/i.test(msg)) {
        console.warn("Google Vision auth failed. Using free local OCR.");
        return runTesseractFromBuffer(imageUrl, imageBuffer);
      }
      throw err;
    }
  }

  return runTesseractFromBuffer(imageUrl, imageBuffer);
}

async function runTesseractFromBuffer(imageUrl, imageBuffer) {
  const buffer = await resolveImageBuffer(imageUrl, imageBuffer);
  try {
    return await runTesseractOcr(buffer);
  } catch (err) {
    if (err.isOperational) throw err;
    throw new AppError(`Local OCR failed: ${err.message}`, 503, "OCR_FAILED");
  }
}

async function runVisionFromBuffer(imageUrl, imageBuffer) {
  const buffer = await resolveImageBuffer(imageUrl, imageBuffer);
  try {
    return await runVisionOcr(buffer);
  } catch (err) {
    if (err.isOperational) throw err;

    const msg = err.message || "Unknown Vision API error";
    if (/credential|ENOENT|authentication|permission|403|401|API key/i.test(msg)) {
      throw new AppError(
        `Google Vision authentication failed: ${msg}. Set OCR_ENGINE=tesseract in backend/.env for free OCR without billing.`,
        503,
        "VISION_AUTH_FAILED"
      );
    }
    if (isBillingOrQuotaError(msg)) {
      throw new AppError(
        `Google Vision requires billing: ${msg}. Set OCR_ENGINE=tesseract in backend/.env for free local OCR.`,
        503,
        "VISION_BILLING_REQUIRED"
      );
    }
    throw new AppError(`OCR failed: ${msg}`, 503, "OCR_FAILED");
  }
}

async function resolveImageBuffer(imageUrl, imageBuffer) {
  if (!imageUrl && !imageBuffer) {
    throw new AppError("Image URL or buffer is required for OCR", 400);
  }

  let buffer = imageBuffer;
  if (!buffer && imageUrl) {
    try {
      buffer = await fetchImageBuffer(imageUrl);
    } catch (err) {
      throw new AppError(`Unable to download image for OCR: ${err.message}`, 400);
    }
  }

  if (!buffer?.length) {
    throw new AppError("Image data is empty", 400);
  }

  return buffer;
}

module.exports = {
  extractTextFromImage,
  fetchImageBuffer,
  runVisionOcr,
  runTesseractOcr,
};
