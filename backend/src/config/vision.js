const fs = require("fs");
const path = require("path");
const vision = require("@google-cloud/vision");

let client = null;

const KEY_FILE_CANDIDATES = [
  path.join(process.cwd(), "google-vision-api-key.txt"),
  path.join(process.cwd(), "vision-api-key.txt"),
];

function readApiKeyFromFile() {
  for (const filePath of KEY_FILE_CANDIDATES) {
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const key = line.trim();
      if (!key || key.startsWith("#")) continue;
      if (key.startsWith("AIza") || key.length >= 30) return key;
    }
  }
  return null;
}

function getApiKey() {
  const fromEnv = process.env.GOOGLE_VISION_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return readApiKeyFromFile();
}

function resolveCredentialsPath() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!raw) return null;
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

function hasApiKey() {
  return Boolean(getApiKey());
}

function hasServiceAccountFile() {
  const credPath = resolveCredentialsPath();
  return Boolean(credPath && fs.existsSync(credPath));
}

function hasInlineCredentials() {
  return Boolean(
    process.env.GCP_VISION_CLIENT_EMAIL && process.env.GCP_VISION_PRIVATE_KEY
  );
}

function isVisionConfigured() {
  return hasApiKey() || hasInlineCredentials() || hasServiceAccountFile();
}

function getVisionConfigError() {
  if (isVisionConfigured()) return null;

  return (
    "Google Vision API key missing. Paste your key in backend/google-vision-api-key.txt " +
    "(one line) OR set GOOGLE_VISION_API_KEY in backend/.env. " +
    "Get key: GCP Console → Credentials → Create API key → restrict to Cloud Vision API."
  );
}

function getVisionClient() {
  if (!hasInlineCredentials() && !hasServiceAccountFile()) {
    const err = new Error(getVisionConfigError());
    err.code = "VISION_NOT_CONFIGURED";
    throw err;
  }

  if (client) return client;

  const options = {};

  if (hasInlineCredentials()) {
    options.credentials = {
      client_email: process.env.GCP_VISION_CLIENT_EMAIL,
      private_key: process.env.GCP_VISION_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  } else {
    options.keyFilename = resolveCredentialsPath();
  }

  if (process.env.GOOGLE_CLOUD_PROJECT) {
    options.projectId = process.env.GOOGLE_CLOUD_PROJECT;
  }

  client = new vision.ImageAnnotatorClient(options);
  return client;
}

module.exports = {
  getVisionClient,
  isVisionConfigured,
  getVisionConfigError,
  hasApiKey,
  hasServiceAccountFile,
  getApiKey,
};
