const medicineService = require("../services/medicineService");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errors");

const medicineController = {
  ocrSuggest: asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("Medicine image is required", 400, "NO_FILE");

    const result = await medicineService.suggestFromImage({ file: req.file });
    return success(res, result, "OCR suggestions ready");
  }),

  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("Medicine image is required", 400, "NO_FILE");

    const result = await medicineService.uploadAndProcess({
      donorId: req.user.id,
      file: req.file,
      body: req.body,
    });

    return success(res, result, "Medicine uploaded and OCR processed", 201);
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
