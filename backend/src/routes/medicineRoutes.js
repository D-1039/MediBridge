const express = require("express");
const medicineController = require("../controllers/medicineController");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadMulti } = require("../middleware/upload");
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

router.get("/search", medicineController.search);
router.get("/suggest", medicineController.suggest);

router.post(
  "/ocr-suggest",
  authenticate,
  authorize(USER_ROLES.DONOR, USER_ROLES.ADMIN),
  upload.single("image"),
  medicineController.ocrSuggest
);

router.post(
  "/ocr-suggest-multi",
  authenticate,
  authorize(USER_ROLES.DONOR, USER_ROLES.ADMIN),
  uploadMulti.array("images", 5),
  medicineController.ocrSuggestMulti
);

router.post(
  "/upload",
  authenticate,
  authorize(USER_ROLES.DONOR, USER_ROLES.ADMIN),
  uploadMulti.fields([
    { name: "images", maxCount: 5 },
    { name: "image", maxCount: 1 },
  ]),
  uploadMedicineValidator,
  validate,
  (req, res, next) => {
    const files = [
      ...(req.files?.images || []),
      ...(req.files?.image || []),
    ];
    req.files = files;
    req.file = files[0] || null;
    next();
  },
  medicineController.upload
);

router.get("/", paginationValidator, validate, medicineController.list);
router.get("/:id", medicineIdValidator, validate, medicineController.getById);

module.exports = router;
