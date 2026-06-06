const express = require("express");
const pharmacistController = require("../controllers/pharmacistController");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const { USER_ROLES } = require("../constants");
const { medicineIdValidator } = require("../validators/medicineValidators");
const { pharmacistNotesValidator } = require("../validators/requestValidators");

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.PHARMACIST, USER_ROLES.ADMIN));

router.get("/pending", pharmacistController.listPending);
router.get("/stats", pharmacistController.stats);
router.get("/medicine/:id", medicineIdValidator, validate, pharmacistController.getMedicine);
router.put(
  "/approve/:id",
  medicineIdValidator,
  pharmacistNotesValidator,
  validate,
  pharmacistController.approve
);
router.put(
  "/reject/:id",
  medicineIdValidator,
  pharmacistNotesValidator,
  validate,
  pharmacistController.reject
);
router.put(
  "/manual-review/:id",
  medicineIdValidator,
  pharmacistNotesValidator,
  validate,
  pharmacistController.manualReview
);

module.exports = router;
