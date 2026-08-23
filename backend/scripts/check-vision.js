/**
 * Verify Google Vision setup. Run: npm run check-vision
 */
require("dotenv").config();
const { isVisionConfigured, getVisionConfigError, hasApiKey } = require("../src/config/vision");

async function main() {
  if (!isVisionConfigured()) {
    console.error("❌", getVisionConfigError());
    console.error("\nQuick setup:");
    console.error("  .\\scripts\\setup-vision.ps1");
    process.exit(1);
  }

  if (hasApiKey()) {
    console.log("✓ Vision configured (API key)");
  } else {
    console.log("✓ Vision configured (service account)");
  }

  const { extractTextFromImage } = require("../src/services/ocrService");
  const fs = require("fs");

  const sample = process.argv[2];
  if (sample && fs.existsSync(sample)) {
    const buf = fs.readFileSync(sample);
    const result = await extractTextFromImage(null, buf);
    console.log("✓ OCR test OK | source:", result.source);
    console.log("Confidence:", result.ocrConfidence);
    console.log("Text preview:\n", result.rawText.slice(0, 400));
  } else {
    console.log("Tip: node scripts/check-vision.js path/to/medicine-photo.jpg");
  }
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
