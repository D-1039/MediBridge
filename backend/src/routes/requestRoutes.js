const express = require("express");
const requestController = require("../controllers/requestController");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const { USER_ROLES } = require("../constants");
const {
  createRequestValidator,
  requestIdValidator,
} = require("../validators/requestValidators");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize(
    USER_ROLES.PHARMACIST,
    USER_ROLES.ADMIN,
    USER_ROLES.DONOR
  ),
  requestController.listAll
);

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.RECEIVER, USER_ROLES.ADMIN),
  createRequestValidator,
  validate,
  requestController.create
);

router.get(
  "/my",
  authenticate,
  authorize(USER_ROLES.RECEIVER, USER_ROLES.ADMIN),
  requestController.myRequests
);

router.put(
  "/:id/approve",
  authenticate,
  authorize(USER_ROLES.PHARMACIST, USER_ROLES.ADMIN, USER_ROLES.DONOR),
  requestIdValidator,
  validate,
  requestController.approve
);

router.put(
  "/:id/complete",
  authenticate,
  authorize(USER_ROLES.PHARMACIST, USER_ROLES.ADMIN, USER_ROLES.DONOR),
  requestIdValidator,
  validate,
  requestController.complete
);

router.put(
  "/:id/reject",
  authenticate,
  authorize(USER_ROLES.PHARMACIST, USER_ROLES.ADMIN),
  requestIdValidator,
  validate,
  requestController.reject
);

module.exports = router;
