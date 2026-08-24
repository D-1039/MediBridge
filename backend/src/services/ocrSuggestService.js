const { extractTextFromImage } = require("./ocrService");
const { parseMedicineFromOcr } = require("../utils/parseMedicine");

/**
 * Optional OCR suggestions only — never authoritative.
 */
async function getOcrSuggestions(imageUrl, imageBuffer = null) {
  try {
    const {
      rawText,
      source,
      batchNumberConfidence,
      batchNumberNeedsReview,
    } = await extractTextFromImage(imageUrl, imageBuffer);
    const parsed = parseMedicineFromOcr(rawText);

    return {
      suggestions: {
          medicine_name: parsed.medicine_name || null,
          expiry_date: parsed.expiry_date || null,
          manufacturing_date: parsed.manufacturing_date || null,
          batch_number: parsed.batch_number || null,
        quantity: parsed.quantity > 0 ? parsed.quantity : null,
      },
      source: source || "paddleocr",
      batchNumberConfidence: batchNumberConfidence ?? null,
      batchNumberNeedsReview: Boolean(batchNumberNeedsReview),
      disclaimer:
        "OCR suggestions are optional and may be incorrect. Always verify the strip manually.",
    };
  } catch (err) {
    if (err.isOperational) throw err;
    return {
      suggestions: null,
      error: err.message,
      disclaimer:
        "OCR could not read this image. Enter details manually.",
    };
  }
}

module.exports = { getOcrSuggestions };
