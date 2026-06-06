const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { authenticate, authorize } = require("../middleware/auth");
const { USER_ROLES } = require("../constants");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize(
    USER_ROLES.ADMIN,
    USER_ROLES.PHARMACIST,
    USER_ROLES.DONOR,
    USER_ROLES.RECEIVER
  ),
  analyticsController.dashboard
);

module.exports = router;
