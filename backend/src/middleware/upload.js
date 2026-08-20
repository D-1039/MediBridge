const multer = require("multer");
const { AppError } = require("../utils/errors");

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError("Only JPEG, PNG, WebP images allowed", 400));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: imageFilter,
});

const uploadMulti = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: imageFilter,
});

module.exports = upload;
module.exports.uploadMulti = uploadMulti;
