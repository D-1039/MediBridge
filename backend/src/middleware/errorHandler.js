const { ValidationError } = require("../utils/errors");

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
  });
}

function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError && err.errors?.length) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    err.isOperational || process.env.NODE_ENV !== "production"
      ? err.message
      : "Internal server error";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code || "INTERNAL_ERROR",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { notFoundHandler, errorHandler };
