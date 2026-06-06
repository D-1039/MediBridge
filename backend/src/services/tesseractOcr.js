const { preprocessForOcr } = require("./imagePreprocess");
const { AppError } = require("../utils/errors");

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = require("tesseract.js");
      const worker = await createWorker("eng");
      return worker;
    })();
  }
  return workerPromise;
}

async function runTesseractOcr(buffer) {
  const processed = await preprocessForOcr(buffer);
  const worker = await getWorker();
  const { data } = await worker.recognize(processed);
  const rawText = data.text?.trim() || "";

  if (!rawText) {
    throw new AppError(
      "No text detected on the medicine image. Use a clear, well-lit photo of the label.",
      422,
      "OCR_NO_TEXT"
    );
  }

  const wordConf =
    data.words?.length > 0
      ? data.words.reduce((sum, w) => sum + (w.confidence || 0), 0) / data.words.length
      : data.confidence || 55;

  const ocrConfidence = Math.min(
    0.85,
    Math.round((wordConf / 100) * 10000) / 10000
  );

  return {
    rawText,
    ocrConfidence: ocrConfidence > 0 ? ocrConfidence : 0.55,
    source: "tesseract",
  };
}

module.exports = { runTesseractOcr };
