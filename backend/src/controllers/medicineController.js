const medicineService = require("../services/medicineService");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errors");

function collectUploadFiles(req) {
  if (req.files?.length) return req.files;
  if (req.file) return [req.file];
  return [];
}

const medicineController = {
  ocrSuggest: asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("Medicine image is required", 400, "NO_FILE");

    const result = await medicineService.suggestFromImage({ file: req.file });
    return success(res, result, "OCR suggestions ready");
  }),

  ocrSuggestMulti: asyncHandler(async (req, res) => {
    const files = collectUploadFiles(req);
    if (!files.length) {
      throw new AppError("At least one medicine image is required", 400, "NO_FILE");
    }
    const result = await medicineService.suggestFromImages({ files });
    return success(res, result, "Multi-image OCR suggestions ready");
  }),

  upload: asyncHandler(async (req, res) => {
    const files = collectUploadFiles(req);
    if (!files.length) {
      throw new AppError("At least one medicine image is required", 400, "NO_FILE");
    }

    const result = await medicineService.uploadAndProcess({
      donorId: req.user.id,
      files,
      body: req.body,
    });

    return success(res, result, "Medicine uploaded and OCR processed", 201);
  }),

  search: asyncHandler(async (req, res) => {
    const q = req.query.q || "";
    const limit = parseInt(req.query.limit, 10) || 10;
    const results = await medicineService.searchInventory(q, { limit });
    return success(res, { query: q, results });
  }),

  suggest: asyncHandler(async (req, res) => {
    const q = req.query.q || "";
    const limit = parseInt(req.query.limit, 10) || 5;
    const data = await medicineService.suggestInventory(q, { limit });
    return success(res, data);
  }),

  list: asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const medicines = await medicineService.listApproved({ limit, offset });
    return success(res, { medicines, limit, offset });
  }),

  getById: asyncHandler(async (req, res) => {
    const medicine = await medicineService.getApprovedById(req.params.id);
    return success(res, medicine);
  }),

  myDonations: asyncHandler(async (req, res) => {
    const medicines = await medicineService.listDonorMedicines(req.user.id);
    return success(res, medicines);
  }),
};

module.exports = medicineController;
