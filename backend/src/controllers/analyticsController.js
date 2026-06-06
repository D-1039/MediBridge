const analyticsService = require("../services/analyticsService");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const analyticsController = {
  dashboard: asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats();
    return success(res, stats);
  }),
};

module.exports = analyticsController;
