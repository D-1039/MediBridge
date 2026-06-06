const { validationResult } = require("express-validator");
const { ValidationError } = require("../utils/errors");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(
      "Validation failed",
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
}

module.exports = validate;
