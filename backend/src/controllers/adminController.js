const adminService = require("../services/adminService");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { NotFoundError } = require("../utils/errors");

const adminController = {
  overview: asyncHandler(async (req, res) => {
    const data = await adminService.getOverview();
    return success(res, data);
  }),

  analytics: asyncHandler(async (req, res) => {
    const data = await adminService.getAnalytics();
    return success(res, data);
  }),

  listMedicines: asyncHandler(async (req, res) => {
    const medicines = await adminService.listMedicines({
      status: req.query.status,
      search: req.query.search,
      category: req.query.category,
      expiryBefore: req.query.expiry_before,
      limit: parseInt(req.query.limit, 10) || 50,
      offset: parseInt(req.query.offset, 10) || 0,
    });
    return success(res, medicines);
  }),

  recentDonations: asyncHandler(async (req, res) => {
    const data = await adminService.getRecentDonations(8);
    return success(res, data);
  }),

  recentRequests: asyncHandler(async (req, res) => {
    const data = await adminService.getRecentRequests(8);
    return success(res, data);
  }),

  medicineDetail: asyncHandler(async (req, res) => {
    const data = await adminService.getMedicineDetail(req.params.id);
    if (!data) throw new NotFoundError("Medicine not found");
    return success(res, data);
  }),
};

module.exports = adminController;
