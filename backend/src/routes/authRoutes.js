const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const {
  registerValidator,
  loginValidator,
  refreshValidator,
} = require("../validators/authValidators");

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, password]
 *             properties:
 *               full_name: { type: string, example: Jane Donor }
 *               email: { type: string, example: jane@example.com }
 *               password: { type: string, example: SecurePass123 }
 *               role: { type: string, enum: [donor, receiver, pharmacist, admin] }
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", registerValidator, validate, authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT tokens
 */
router.post("/login", loginValidator, validate, authController.login);

router.post("/refresh", refreshValidator, validate, authController.refresh);
router.post("/logout", refreshValidator, validate, authController.logout);
router.get("/me", authenticate, authController.me);

module.exports = router;
