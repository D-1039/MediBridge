/**
 * Medicine safety score (0–100) from user-entered metadata and pharmacist review.
 * Does not depend on OCR accuracy.
 */

function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}

function computeSafetyScore({
  expiryDate = null,
  batchNumber = null,
  medicineName = null,
  manufacturingDate = null,
  pharmacistVerified = false,
}) {
  let score = 0;

  const days = daysUntilExpiry(expiryDate);
  if (days === null) {
    score += 0;
  } else if (days < 0) {
    score += 0;
  } else if (days < 90) {
    score += 15;
  } else if (days < 180) {
    score += 25;
  } else {
    score += 35;
  }

  if (batchNumber) score += 20;
  if (medicineName && medicineName.length >= 3) score += 25;
  if (manufacturingDate) score += 10;
  if (pharmacistVerified) score += 10;

  return Math.min(100, Math.max(0, score));
}

function runSafetyValidation({
  expiryDate,
  batchNumber,
  medicineName,
  expiryWarningDays = 90,
}) {
  const issues = [];
  const days = daysUntilExpiry(expiryDate);

  if (!expiryDate) issues.push("missing_expiry_date");
  else if (days !== null && days < 0) issues.push("expired");
  else if (days !== null && days <= expiryWarningDays)
    issues.push("expiring_within_90_days");

  if (!batchNumber) issues.push("missing_batch_number");
  if (!medicineName) issues.push("missing_medicine_name");

  return {
    issues,
    requiresManualReview: issues.length > 0,
    daysUntilExpiry: days,
  };
}

module.exports = {
  computeSafetyScore,
  runSafetyValidation,
  daysUntilExpiry,
};
