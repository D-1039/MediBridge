const {
  computeSafetyScore,
  runSafetyValidation,
} = require("../utils/safetyScore");
const { MEDICINE_STATUS } = require("../constants");
const { extractTextFromImage } = require("./ocrService");
const medicineRepository = require("../repositories/medicineRepository");
const auditService = require("./auditService");
const { AUDIT_ACTIONS } = require("../constants");

/**
 * Save donor-entered fields; OCR text stored for pharmacist reference only.
 */
async function processOcrForMedicine(
  medicineId,
  imageUrl,
  userId,
  imageBuffer,
  userFields
) {
  const warningDays = parseInt(process.env.SAFETY_EXPIRY_WARNING_DAYS || "90", 10);

  const medicineName = userFields.medicine_name;
  const expiryDate = userFields.expiry_date;
  const batchNumber = userFields.batch_number;
  const manufacturingDate = userFields.manufacturing_date;
  const quantity = userFields.quantity ?? 1;
  const dosage = userFields.dosage;

  const validation = runSafetyValidation({
    expiryDate,
    batchNumber,
    medicineName,
    expiryWarningDays: warningDays,
  });

  const safetyScore = computeSafetyScore({
    expiryDate,
    batchNumber,
    medicineName,
    manufacturingDate,
    pharmacistVerified: false,
  });

  let status = MEDICINE_STATUS.PENDING_PHARMACIST;
  if (validation.requiresManualReview) {
    status = MEDICINE_STATUS.MANUAL_REVIEW;
  }

  let ocrText = null;
  try {
    const { rawText } = await extractTextFromImage(imageUrl, imageBuffer);
    ocrText = rawText;
    await auditService.log({
      userId,
      medicineId,
      action: AUDIT_ACTIONS.OCR_PROCESSED,
      description: "OCR reference text stored (donor-entered fields used for record)",
    });
  } catch (err) {
    await auditService.log({
      userId,
      medicineId,
      action: AUDIT_ACTIONS.OCR_PROCESSED,
      description: `OCR reference unavailable: ${err.message}`,
    });
  }

  const updated = await medicineRepository.update(medicineId, {
    medicine_name: medicineName,
    dosage,
    batch_number: batchNumber,
    expiry_date: expiryDate,
    manufacturing_date: manufacturingDate,
    quantity,
    ocr_text: ocrText,
    ocr_confidence: null,
    ocr_matched_name: null,
    fuzzy_match_confidence: null,
    safety_score: safetyScore,
    status,
  });

  if (status === MEDICINE_STATUS.MANUAL_REVIEW) {
    await auditService.log({
      userId,
      medicineId,
      action: AUDIT_ACTIONS.MANUAL_REVIEW,
      description: `Flagged for manual review: ${validation.issues.join(", ")}`,
    });
  }

  return {
    medicine: updated,
    validation,
  };
}

module.exports = { processOcrForMedicine };
