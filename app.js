require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const apiLimiter = require("./middlewares/rateLimiter");
const config = require("./config");
const logger = require("./utils/logger");

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: config.clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(helmet());
app.use(hpp());
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: config.jsonLimit }));
app.use(cookieParser());
app.use(apiLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const routes = [
  ["/api/auth", "authRoutes"],
  ["/api/users", "userRoutes"],
  ["/api/profile", "profileRoutes"],
  ["/api/notifications", "notificationRoutes"],
  ["/api/logs", "logRoutes"],
  ["/api/tokens", "tokenRoutes"],
  ["/api/password-resets", "passwordResetRoutes"],
  ["/api/otp-codes", "otpCode"],
  ["/api/protected", "protectedRoutes"],
];

routes.forEach(([path, moduleName]) => {
  app.use(path, require(`./routes/${moduleName}`));
  logger.debug(`Route mounted: ${path}`);
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON payload" });
  }
  return next(err);
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
