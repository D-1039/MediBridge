const { body } = require("express-validator");
const { USER_ROLES } = require("../constants");

const registerValidator = [
  body("full_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body().custom((_, { req }) => {
    const name = (req.body.full_name || req.body.fullName || "").trim();
    if (!name) throw new Error("Full name is required");
    req.body.full_name = name;
    return true;
  }),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage("Invalid role"),
];

const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

const refreshValidator = [
  body("refreshToken").notEmpty().withMessage("Refresh token required"),
];

module.exports = { registerValidator, loginValidator, refreshValidator };
