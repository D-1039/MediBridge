const { body, param } = require("express-validator");

const createRequestValidator = [
  body("medicine_id").isUUID().withMessage("Valid medicine_id required"),
  body("requested_quantity")
    .optional()
    .isInt({ min: 1, max: 999 })
    .withMessage("Quantity must be between 1 and 999"),
  body("search_query").optional().trim().isLength({ max: 255 }),
];

const requestIdValidator = [param("id").isUUID().withMessage("Invalid request ID")];

const assignRequestValidator = [
  param("id").isUUID().withMessage("Invalid request ID"),
  body("assigned_medicine_id")
    .isUUID()
    .withMessage("Valid assigned_medicine_id required"),
  body("assigned_quantity")
    .optional()
    .isInt({ min: 1, max: 999 })
    .withMessage("Assigned quantity must be between 1 and 999"),
];

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
  assignRequestValidator,
  pharmacistNotesValidator,
};
