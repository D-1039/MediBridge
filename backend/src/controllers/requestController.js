const requestService = require("../services/requestService");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const requestController = {
  create: asyncHandler(async (req, res) => {
    const request = await requestService.create({
      receiverId: req.user.id,
      medicineId: req.body.medicine_id,
      requestedQuantity: req.body.requested_quantity,
      searchQuery: req.body.search_query,
    });
    return success(res, request, "Request submitted successfully", 201);
  }),

  getById: asyncHandler(async (req, res) => {
    const request = await requestService.getById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return success(res, request);
  }),

  listAll: asyncHandler(async (req, res) => {
    const withMatches = req.query.match === "true";
    const requests = withMatches
      ? await requestService.listAllWithMatches()
      : await requestService.listAll();
    return success(res, requests);
  }),

  myRequests: asyncHandler(async (req, res) => {
    const requests = await requestService.listMyRequests(req.user.id);
    return success(res, requests);
  }),

  myStats: asyncHandler(async (req, res) => {
    const stats = await requestService.getReceiverStats(req.user.id);
    return success(res, stats);
  }),

  analytics: asyncHandler(async (req, res) => {
    const analytics = await requestService.getAnalytics();
    return success(res, analytics);
  }),

  review: asyncHandler(async (req, res) => {
    const request = await requestService.review(req.params.id, req.user.id);
    return success(res, request, "Request under review");
  }),

  assign: asyncHandler(async (req, res) => {
    const request = await requestService.assign(req.params.id, req.user.id, {
      assignedMedicineId: req.body.assigned_medicine_id,
      assignedQuantity: req.body.assigned_quantity,
    });
    return success(res, request, "Medicine assigned");
  }),

  markReady: asyncHandler(async (req, res) => {
    const request = await requestService.markReady(req.params.id, req.user.id);
    return success(res, request, "Marked ready for collection");
  }),

  approve: asyncHandler(async (req, res) => {
    const request = await requestService.review(req.params.id, req.user.id);
    return success(res, request, "Request approved for review");
  }),

  complete: asyncHandler(async (req, res) => {
    const request = await requestService.complete(req.params.id, req.user.id);
    return success(res, request, "Distribution completed");
  }),

  reject: asyncHandler(async (req, res) => {
    const request = await requestService.reject(
      req.params.id,
      req.user.id,
      req.body.notes
    );
    return success(res, request, "Request rejected");
  }),
};

module.exports = requestController;
