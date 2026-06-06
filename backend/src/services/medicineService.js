const medicineRepository = require("../repositories/medicineRepository");
const { uploadMedicineImage } = require("./firebaseService");
const { processOcrForMedicine } = require("./medicineProcessingService");
const { getOcrSuggestions } = require("./ocrSuggestService");
const auditService = require("./auditService");
const { MEDICINE_STATUS, AUDIT_ACTIONS } = require("../constants");
const { NotFoundError } = require("../utils/errors");

const medicineService = {
  /** Optional OCR suggestions — does not write to database. */
  async suggestFromImage({ file }) {
    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    return getOcrSuggestions(dataUrl, file.buffer);
  },

  async uploadAndProcess({ donorId, file, body }) {
    const userFields = {
      medicine_name: (body.medicine_name || body.medicineName || "").trim(),
      expiry_date: body.expiry_date || body.expiryDate || null,
      batch_number: body.batch_number || body.batchNumber || null,
      manufacturing_date: body.manufacturing_date || body.manufacturingDate || null,
      quantity: parseInt(body.quantity, 10) || 1,
      dosage: body.dosage || null,
    };

    const { url } = await uploadMedicineImage(file, donorId);

    const medicine = await medicineRepository.create({
      donorId,
      medicineName: userFields.medicine_name,
      dosage: userFields.dosage,
      batchNumber: userFields.batch_number,
      expiryDate: userFields.expiry_date,
      quantity: userFields.quantity,
      imageUrl: url,
      status: MEDICINE_STATUS.PENDING_OCR,
    });

    await auditService.log({
      userId: donorId,
      medicineId: medicine.id,
      action: AUDIT_ACTIONS.UPLOAD,
      description: "Medicine strip image uploaded with donor-entered details",
    });

    try {
      const result = await processOcrForMedicine(
        medicine.id,
        url,
        donorId,
        file.buffer,
        userFields
      );
      return { medicine: result.medicine, validation: result.validation };
    } catch (err) {
      await medicineRepository.update(medicine.id, {
        status: MEDICINE_STATUS.MANUAL_REVIEW,
      });
      await auditService.log({
        userId: donorId,
        medicineId: medicine.id,
        action: AUDIT_ACTIONS.MANUAL_REVIEW,
        description: `Processing error: ${err.message}`,
      });
      const updated = await medicineRepository.findById(medicine.id);
      return { medicine: updated, ocrError: err.message };
    }
  },

  async listApproved({ limit, offset }) {
    return medicineRepository.findApproved({ limit, offset });
  },

  async getById(id) {
    const medicine = await medicineRepository.findById(id);
    if (!medicine) throw new NotFoundError("Medicine not found");
    return medicine;
  },

  async getApprovedById(id) {
    const medicine = await this.getById(id);
    if (medicine.status !== MEDICINE_STATUS.APPROVED) {
      throw new NotFoundError("Medicine not available");
    }
    return medicine;
  },

  async listDonorMedicines(donorId) {
    return medicineRepository.findByDonor(donorId);
  },
};

module.exports = medicineService;
