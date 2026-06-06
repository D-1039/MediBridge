const { body, param } = require("express-validator");

const createRequestValidator = [
  body("medicine_id").isUUID().withMessage("Valid medicine_id required"),
];

const requestIdValidator = [param("id").isUUID().withMessage("Invalid request ID")];

const pharmacistNotesValidator = [
  body("notes").optional().trim().isLength({ max: 2000 }),
  body("medicine_name").optional().trim().isLength({ max: 255 }),
  body("dosage").optional().trim().isLength({ max: 100 }),
  body("batch_number").optional().trim().isLength({ max: 100 }),
  body("expiry_date").optional().isISO8601(),
  body("quantity").optional().isInt({ min: 1 }),
];

module.exports = {
  createRequestValidator,
  requestIdValidator,
  pharmacistNotesValidator,
};
