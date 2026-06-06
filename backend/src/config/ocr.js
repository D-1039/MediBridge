const { isVisionConfigured } = require("./vision");

function getOcrEnginePreference() {
  const raw = (process.env.OCR_ENGINE || "auto").toLowerCase().trim();
  if (["tesseract", "free", "local"].includes(raw)) return "tesseract";
  if (["google", "vision", "google_vision"].includes(raw)) return "google_vision";
  return "auto";
}

function usesFreeOcrOnly() {
  return getOcrEnginePreference() === "tesseract";
}

function isOcrConfigured() {
  if (usesFreeOcrOnly()) return true;
  if (getOcrEnginePreference() === "google_vision") {
    return isVisionConfigured();
  }
  return true;
}

function getOcrHealth() {
  const preference = getOcrEnginePreference();
  const visionConfigured = isVisionConfigured();

  if (preference === "tesseract") {
    return {
      engine: "tesseract",
      configured: true,
      mode: "free_local",
      billingRequired: false,
      visionAvailable: visionConfigured,
    };
  }

  if (preference === "google_vision") {
    return {
      engine: "google_vision",
      configured: visionConfigured,
      mode: visionConfigured
        ? process.env.GOOGLE_VISION_API_KEY
          ? "api_key"
          : "service_account"
        : "not_configured",
      billingRequired: true,
      visionAvailable: visionConfigured,
    };
  }

  return {
    engine: visionConfigured ? "google_vision_with_tesseract_fallback" : "tesseract",
    configured: true,
    mode: visionConfigured ? "auto" : "free_local",
    billingRequired: false,
    visionAvailable: visionConfigured,
  };
}

module.exports = {
  getOcrEnginePreference,
  usesFreeOcrOnly,
  isOcrConfigured,
  getOcrHealth,
};
