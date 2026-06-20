const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const authMiddleware = require("../middlewares/authMiddleware");

router.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//  Get all notifications for the user (with pagination)
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title message type isRead timestamp");

    const total = await Notification.countDocuments({
      userId: req.user.userId,
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

//  Mark notifications as read
router.patch(
  "/read",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: "Notification IDs are required and must be an array",
      });
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds }, userId: req.user.userId },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "Notifications marked as read" });
  })
);

//  Delete all old notifications
router.delete(
  "/clear",
  authMiddleware,
  asyncHandler(async (req, res) => {
    await Notification.deleteMany({ userId: req.user.userId, isRead: true });

    res.json({ success: true, message: "Old notifications cleared" });
  })
);

router.post(
  "/create",
  authMiddleware,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 5, max: 500 })
      .withMessage("Message must be between 5 and 500 characters"),
    body("type")
      .trim()
      .notEmpty()
      .withMessage("Type is required")
      .isIn(["NEW_MESSAGE", "WARNING", "SYSTEM_UPDATE", "ALERT"])
      .withMessage("Invalid notification type"),
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

    const { title, message, type } = req.body;

    const newNotification = new Notification({
      userId: req.user.userId,
      title,
      message,
      type,
      isRead: false,
    });

    await newNotification.save();

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: newNotification,
    });
  })
);

router.use((err, req, res, next) => {
  console.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

module.exports = router;
