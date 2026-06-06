const pharmacistService = require("../services/pharmacistService");
const auditRepository = require("../repositories/auditRepository");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const pharmacistController = {
  listPending: asyncHandler(async (req, res) => {
    const medicines = await pharmacistService.listPending();
    return success(res, medicines);
  }),

  stats: asyncHandler(async (req, res) => {
    const stats = await pharmacistService.getVerificationStats();
    return success(res, stats);
  }),

  getMedicine: asyncHandler(async (req, res) => {
    const medicine = await pharmacistService.getMedicine(req.params.id);
    const auditTrail = await auditRepository.findByMedicine(req.params.id);
    return success(res, { medicine, auditTrail });
  }),

  approve: asyncHandler(async (req, res) => {
    const medicine = await pharmacistService.approve(
      req.params.id,
      req.user.id,
      req.body.notes,
      req.body
    );
    return success(res, medicine, "Medicine approved");
  }),

  reject: asyncHandler(async (req, res) => {
    const medicine = await pharmacistService.reject(
      req.params.id,
      req.user.id,
      req.body.notes
    );
    return success(res, medicine, "Medicine rejected");
  }),

  manualReview: asyncHandler(async (req, res) => {
    const medicine = await pharmacistService.sendToManualReview(
      req.params.id,
      req.user.id,
      req.body.notes
    );
    return success(res, medicine, "Sent to manual review");
  }),
};

module.exports = pharmacistController;
