const multer = require("multer");
const { AppError } = require("../utils/errors");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError("Only JPEG, PNG, WebP images allowed", 400));
    }
    cb(null, true);
  },
});

module.exports = upload;
