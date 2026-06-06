const express = require("express");
const medicineController = require("../controllers/medicineController");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { USER_ROLES } = require("../constants");
const {
  uploadMedicineValidator,
  medicineIdValidator,
  paginationValidator,
} = require("../validators/medicineValidators");

const router = express.Router();

router.get(
  "/donor/my",
  authenticate,
  authorize(USER_ROLES.DONOR, USER_ROLES.ADMIN),
  medicineController.myDonations
);

router.post(
  "/ocr-suggest",
  authenticate,
  authorize(USER_ROLES.DONOR, USER_ROLES.ADMIN),
  upload.single("image"),
  medicineController.ocrSuggest
);

router.post(
  "/upload",
  authenticate,
  authorize(USER_ROLES.DONOR, USER_ROLES.ADMIN),
  upload.single("image"),
  uploadMedicineValidator,
  validate,
  medicineController.upload
);

router.get("/", paginationValidator, validate, medicineController.list);
router.get("/:id", medicineIdValidator, validate, medicineController.getById);

module.exports = router;
