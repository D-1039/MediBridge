const sharp = require("sharp");

/** Light preprocessing for optional OCR suggestions. */
async function preprocessForOcr(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .grayscale()
    .normalize()
    .toBuffer();
}

module.exports = { preprocessForOcr };
