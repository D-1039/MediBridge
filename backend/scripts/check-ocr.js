/**
 * Verify OCR setup. Run: npm run check-ocr [image.jpg]
 */
require("dotenv").config();
const fs = require("fs");
const { getOcrHealth } = require("../src/config/ocr");
const { extractTextFromImage } = require("../src/services/ocrService");

async function main() {
  const health = getOcrHealth();
  console.log("OCR config:", health);

  const sample = process.argv[2];
  if (!sample || !fs.existsSync(sample)) {
    console.log("\nTip: npm run check-ocr path/to/medicine-photo.jpg");
    return;
  }

  const buf = fs.readFileSync(sample);
  const result = await extractTextFromImage(null, buf);
  console.log("\n✓ OCR test OK");
  console.log("Source:", result.source);
  console.log("Confidence:", result.ocrConfidence);
  console.log("Text preview:\n", result.rawText.slice(0, 400));
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
