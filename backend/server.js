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
  console.log(`OCR: PaddleOCR service at ${ocr.serviceUrl}`);

  const server = app.listen(PORT, () => {
    console.log(`MediBridge API running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the other backend process or set PORT in backend/.env`
      );
      process.exit(1);
    }
    throw err;
  });
}

start();
