const medicineRepository = require("../repositories/medicineRepository");
const medicineImageRepository = require("../repositories/medicineImageRepository");
const { uploadMedicineImage } = require("./firebaseService");
const { processOcrForMedicine } = require("./medicineProcessingService");
const { getOcrSuggestions } = require("./ocrSuggestService");
const inventorySearchService = require("./inventorySearchService");
const auditService = require("./auditService");
const { mergeOcrSuggestions } = require("../utils/mergeOcrResults");
const { MEDICINE_STATUS, AUDIT_ACTIONS } = require("../constants");
const { NotFoundError, ValidationError } = require("../utils/errors");

const IMAGE_LABELS = ["front", "back", "expiry", "box", "extra"];

async function attachImages(medicines) {
  if (!medicines.length) return medicines;
  const ids = medicines.map((m) => m.id);
  const images = await medicineImageRepository.findByMedicineIds(ids);
  const byMedicine = images.reduce((acc, img) => {
    if (!acc[img.medicine_id]) acc[img.medicine_id] = [];
    acc[img.medicine_id].push(img);
    return acc;
  }, {});
  return medicines.map((m) => ({
    ...m,
    images: byMedicine[m.id] || [
      { id: m.id, image_url: m.image_url, label: "front", sort_order: 0 },
    ],
  }));
}

const medicineService = {
  /** Optional OCR suggestions — does not write to database. */
  async suggestFromImage({ file }) {
    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    return getOcrSuggestions(dataUrl, file.buffer);
  },

  async suggestFromImages({ files }) {
    if (!files?.length) {
      throw new ValidationError("At least one image is required");
    }
    const suggestions = [];
    for (const file of files) {
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      suggestions.push(await getOcrSuggestions(dataUrl, file.buffer));
    }
    const merged = mergeOcrSuggestions(suggestions);
    return {
      suggestions: merged,
      source: "multi-image-merge",
      batchNumberConfidence: suggestions
        .map((item) => item.batchNumberConfidence)
        .filter((confidence) => confidence != null)
        .reduce((lowest, confidence) => Math.min(lowest, confidence), 1) || null,
      batchNumberNeedsReview: suggestions.some(
        (item) => item.batchNumberNeedsReview === true
      ),
      disclaimer:
        "OCR suggestions merged from multiple images. Always verify manually.",
      images_processed: files.length,
    };
  },

  async uploadAndProcess({ donorId, files, body }) {
    if (!files?.length) {
      throw new ValidationError("At least one medicine image is required");
    }
    if (files.length > 5) {
      throw new ValidationError("Maximum 5 images allowed");
    }

    const userFields = {
      medicine_name: (body.medicine_name || body.medicineName || "").trim(),
      expiry_date: body.expiry_date || body.expiryDate || null,
      batch_number: body.batch_number || body.batchNumber || null,
      batch_number_verified: body.batch_number_verified !== "false",
      manufacturing_date: body.manufacturing_date || body.manufacturingDate || null,
      quantity: parseInt(body.quantity, 10) || 1,
      dosage: body.dosage || null,
    };

    const uploaded = [];
    for (let i = 0; i < files.length; i += 1) {
      const { url } = await uploadMedicineImage(files[i], donorId);
      uploaded.push({
        url,
        label: IMAGE_LABELS[i] || `image_${i + 1}`,
        sort_order: i,
        buffer: files[i].buffer,
      });
    }

    const primary = uploaded[0];
    const medicine = await medicineRepository.create({
      donorId,
      medicineName: userFields.medicine_name,
      dosage: userFields.dosage,
      batchNumber: userFields.batch_number,
      batchNumberVerified: userFields.batch_number_verified,
      expiryDate: userFields.expiry_date,
      quantity: userFields.quantity,
      imageUrl: primary.url,
      status: MEDICINE_STATUS.PENDING_OCR,
    });

    await medicineImageRepository.createMany(
      medicine.id,
      uploaded.map(({ url, label, sort_order }) => ({ url, label, sort_order }))
    );

    await auditService.log({
      userId: donorId,
      medicineId: medicine.id,
      action: AUDIT_ACTIONS.UPLOAD,
      description: `Medicine uploaded with ${uploaded.length} image(s)`,
    });

    try {
      const ocrTexts = [];
      const ocrResults = [];
      for (const img of uploaded) {
        const dataUrl = `data:image/jpeg;base64,${img.buffer.toString("base64")}`;
        const { extractTextFromImage } = require("./ocrService");
        try {
          const ocrResult = await extractTextFromImage(dataUrl, img.buffer);
          ocrResults.push(ocrResult);
          const { rawText } = ocrResult;
          if (rawText) ocrTexts.push(rawText);
        } catch {
          /* optional per-image OCR */
        }
      }

      const result = await processOcrForMedicine(
        medicine.id,
        primary.url,
        donorId,
        primary.buffer,
        userFields,
        ocrTexts.join("\n\n---\n\n") || null
      );
      const withImages = await this.getById(medicine.id);
      return {
        medicine: withImages,
        validation: result.validation,
        ocr: {
          source: ocrResults[0]?.source || "paddleocr",
          ocrConfidence: ocrResults[0]?.ocrConfidence ?? null,
          medicalMetadata: ocrResults[0]?.medicalMetadata || {
            expiry: null,
            batchNumber: null,
            dosages: [],
          },
        },
      };
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
      const updated = await this.getById(medicine.id);
      return { medicine: updated, ocrError: err.message };
    }
  },

  async listApproved({ limit, offset }) {
    const medicines = await medicineRepository.findApproved({ limit, offset });
    return attachImages(medicines);
  },

  async searchInventory(query, { limit } = {}) {
    return inventorySearchService.search(query, { limit });
  },

  async suggestInventory(query, { limit } = {}) {
    return inventorySearchService.suggest(query, { limit });
  },

  async getById(id) {
    const medicine = await medicineRepository.findById(id);
    if (!medicine) throw new NotFoundError("Medicine not found");
    const images = await medicineImageRepository.findByMedicineId(id);
    return {
      ...medicine,
      images: images.length
        ? images
        : [{ image_url: medicine.image_url, label: "front", sort_order: 0 }],
    };
  },

  async getApprovedById(id) {
    const medicine = await this.getById(id);
    if (medicine.status !== MEDICINE_STATUS.APPROVED) {
      throw new NotFoundError("Medicine not available");
    }
    const availability = await medicineRepository.getAvailableQuantity(id);
    return {
      ...medicine,
      available_quantity: availability?.available_quantity ?? medicine.quantity,
    };
  },

  async listDonorMedicines(donorId) {
    const medicines = await medicineRepository.findByDonor(donorId);
    return attachImages(medicines);
  },
};

module.exports = medicineService;
