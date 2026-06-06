const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "../.env.local"), override: true });

const app = require("./src/app");
const { pool } = require("./src/config/database");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    if (process.env.NODE_ENV === "production") process.exit(1);
  }

  const { getOcrHealth } = require("./src/config/ocr");
  const ocr = getOcrHealth();
  if (ocr.engine === "tesseract" || ocr.mode === "free_local") {
    console.log("✓ OCR: free local engine (Tesseract) — no Google billing");
  } else if (ocr.visionAvailable) {
    console.log("✓ OCR: Google Vision (+ Tesseract fallback if billing blocks)");
  } else {
    console.log("✓ OCR: Tesseract (Vision not configured)");
  }

  app.listen(PORT, () => {
    console.log(`MediBridge API running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
  });
}

start();
