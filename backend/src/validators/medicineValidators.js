const { body, param, query } = require("express-validator");

const uploadMedicineValidator = [
  body("quantity").optional().isInt({ min: 1, max: 10000 }),
  body("medicine_name").optional().trim().isLength({ max: 255 }),
  body("dosage").optional().trim().isLength({ max: 100 }),
  body("batch_number").optional().trim().isLength({ max: 100 }),
  body("expiry_date").optional().isISO8601().toDate(),
];

const medicineIdValidator = [param("id").isUUID().withMessage("Invalid medicine ID")];

const paginationValidator = [
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("offset").optional().isInt({ min: 0 }).toInt(),
];

module.exports = { uploadMedicineValidator, medicineIdValidator, paginationValidator };
