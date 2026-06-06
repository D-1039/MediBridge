const authService = require("../services/authService");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return success(res, result, "Registration successful", 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return success(res, result, "Login successful");
  }),

  refresh: asyncHandler(async (req, res) => {
    const tokens = await authService.refresh(req.body.refreshToken);
    return success(res, tokens, "Token refreshed");
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    return success(res, null, "Logged out");
  }),

  me: asyncHandler(async (req, res) => {
    const { password_hash, ...user } = req.user;
    return success(res, {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });
  }),
};

module.exports = authController;
