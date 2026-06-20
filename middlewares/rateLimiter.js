const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    status: 429,
    message: "Too many requests. Please try again later.",
  },
  headers: true, //  Include rate limit info in headers
  standardHeaders: true, //  Return rate limit details in `RateLimit-*` headers
  legacyHeaders: false, //  Disable `X-RateLimit-*` headers (deprecated)
});

module.exports = apiLimiter;
