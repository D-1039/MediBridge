const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { getBucket } = require("../config/firebase");
const { AppError } = require("../utils/errors");

const LOCAL_UPLOAD_DIR = path.join(__dirname, "../../uploads");

function useLocalStorage() {
  return (
    process.env.USE_LOCAL_STORAGE === "true" ||
    (process.env.NODE_ENV !== "production" && !process.env.FIREBASE_PROJECT_ID)
  );
}

async function uploadToLocal(file, donorId) {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }

  const ext = file.mimetype.split("/")[1].replace("jpeg", "jpg");
  const fileName = `${uuidv4()}.${ext}`;
  const relativePath = path.join("medicines", donorId, fileName);
  const absolutePath = path.join(LOCAL_UPLOAD_DIR, relativePath);
  const dir = path.dirname(absolutePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await fs.promises.writeFile(absolutePath, file.buffer);

  const base =
    process.env.API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";
  const url = `${base}/uploads/${relativePath.replace(/\\/g, "/")}`;

  return { filePath: relativePath, url };
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

async function uploadMedicineImage(file, donorId) {
  if (useLocalStorage()) {
    return uploadToLocal(file, donorId);
  }

  const bucket = getBucket();
  if (!bucket) {
    throw new AppError("Firebase Storage is not configured", 503, "STORAGE_UNAVAILABLE");
  }

  if (!file || !file.buffer) {
    throw new AppError("No image file provided", 400, "NO_FILE");
  }

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    throw new AppError("Invalid image type. Use JPEG, PNG, or WebP", 400, "INVALID_FILE_TYPE");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new AppError("Image exceeds 10MB limit", 400, "FILE_TOO_LARGE");
  }

  const ext = file.mimetype.split("/")[1].replace("jpeg", "jpg");
  const filePath = `medicines/${donorId}/${uuidv4()}.${ext}`;
  const fileRef = bucket.file(filePath);

  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
      metadata: { donorId, uploadedAt: new Date().toISOString() },
    },
    resumable: false,
  });

  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: "03-01-2030",
  });

  return {
    filePath,
    url: url || `https://storage.googleapis.com/${bucket.name}/${filePath}`,
  };
}

async function getImageURL(filePath) {
  const bucket = getBucket();
  if (!bucket) throw new AppError("Firebase Storage is not configured", 503);

  const fileRef = bucket.file(filePath);
  const [exists] = await fileRef.exists();
  if (!exists) throw new AppError("Image not found", 404);

  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
  });
  return url;
}

async function deleteImage(filePath) {
  const bucket = getBucket();
  if (!bucket) return;
  try {
    await bucket.file(filePath).delete();
  } catch {
    // ignore if already deleted
  }
}

module.exports = {
  uploadMedicineImage,
  getImageURL,
  deleteImage,
};
