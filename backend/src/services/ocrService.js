const https = require("https");
const http = require("http");
const { runPaddleOcr } = require("./ocrClient");
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

async function extractTextFromImage(imageUrl, imageBuffer = null) {
  const buffer = await resolveImageBuffer(imageUrl, imageBuffer);
  return runPaddleOcr(buffer);
}

module.exports = { extractTextFromImage, fetchImageBuffer, runPaddleOcr };
