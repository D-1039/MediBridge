function getOcrHealth() {
  return {
    engine: "paddleocr",
    configured: Boolean(process.env.OCR_SERVICE_URL),
    serviceUrl: process.env.OCR_SERVICE_URL || "http://localhost:8000",
    mode: "python_microservice",
  };
}

module.exports = { getOcrHealth };
