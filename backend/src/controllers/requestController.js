const requestService = require("../services/requestService");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const requestController = {
  create: asyncHandler(async (req, res) => {
    const request = await requestService.create({
      receiverId: req.user.id,
      medicineId: req.body.medicine_id,
    });
    return success(res, request, "Request created", 201);
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

  approve: asyncHandler(async (req, res) => {
    const request = await requestService.approve(req.params.id, req.user.id);
    return success(res, request, "Request approved");
  }),

  complete: asyncHandler(async (req, res) => {
    const request = await requestService.complete(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return success(res, request, "Distribution completed");
  }),

  reject: asyncHandler(async (req, res) => {
    const request = await requestService.reject(req.params.id);
    return success(res, request, "Request rejected");
  }),
};

module.exports = requestController;
