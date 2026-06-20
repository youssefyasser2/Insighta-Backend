const express = require("express");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const winston = require("winston");
const {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

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

//  Apply authentication middleware to all routes
router.use(authMiddleware);

//  Create a user (Only authenticated users)
router.post(
  "/",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("bio").optional().trim(),
    body("avatar")
      .optional()
      .trim()
      .isURL()
      .withMessage("Avatar must be a valid URL"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, bio, avatar } = req.body;
    const userId = req.user.userId;

    const user = await createUser(userId, { firstName, lastName, bio, avatar });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  })
);

//  Retrieve authenticated user's data
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

//  Update authenticated user's data
router.put(
  "/",
  [
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("bio").optional().trim(),
    body("avatar")
      .optional()
      .trim()
      .isURL()
      .withMessage("Avatar must be a valid URL"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const userId = req.user.userId;
    const updates = req.body;

    const updatedUser = await updateUser(userId, updates);

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  })
);

//  Delete user by ID
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const deleteUserId = req.params.id;

    // Ensure the user can only delete their own account
    if (deleteUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this user",
      });
    }

    await deleteUser(deleteUserId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
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
