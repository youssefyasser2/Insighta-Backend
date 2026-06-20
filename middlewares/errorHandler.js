const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Request failed", {
    error: err,
    method: req.method,
    path: req.originalUrl,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";

  switch (err.name) {
    case "ValidationError":
      statusCode = 400;
      message = "Invalid data. Please check your inputs.";
      break;
    case "JsonWebTokenError":
      statusCode = 401;
      message = "Invalid token. Please log in.";
      break;
    case "TokenExpiredError":
      statusCode = 401;
      message = "Token expired. Please log in again.";
      break;
    default:
      if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate entry. This data already exists.";
      }
  }

  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal server error. Please try again later.";
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
