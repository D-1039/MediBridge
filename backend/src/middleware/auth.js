const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const userRepository = require("../repositories/userRepository");
const { UnauthorizedError } = require("../utils/errors");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access token required");
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, jwtConfig.accessSecret);
    const user = await userRepository.findById(payload.sub);
    if (!user) throw new UnauthorizedError("User not found");
    req.user = user;
    next();
  } catch (err) {
    if (err.isOperational) throw err;
    throw new UnauthorizedError("Invalid or expired token");
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) {
      const { ForbiddenError } = require("../utils/errors");
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  };
}

module.exports = { authenticate, authorize };
