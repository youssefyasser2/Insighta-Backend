const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware"); // To protect routes
const asyncHandler = require("express-async-handler"); // For handling async functions
const winston = require("winston"); // For logging

//  Winston Logger Setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

//  Logging Middleware
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

//  Get all users (requires authentication)
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password") // Exclude sensitive fields
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

//  Get current user's data (requires authentication)
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: " User not found" });
    }

    res.json(user);
  })
);

//  Error Handling Middleware
router.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

module.exports = router;
