const express = require("express");
const { body, param } = require("express-validator");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} = require("../controllers/passwordResetController");

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many password reset attempts. Please try again later.",
});

router.post(
  "/request",
  resetLimiter,
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid input")
    .normalizeEmail(),
  requestPasswordReset
);

router.get(
  "/verify/:token",
  param("token")
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid input")
    .matches(/^[a-f0-9]{64}$/)
    .withMessage("Invalid input"),
  verifyResetToken
);

router.post(
  "/reset-password",
  resetLimiter,
  body("Invalid input"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Invalid input")
    .matches(/[A-Z]/)
    .withMessage("Invalid input")
    .matches(/[a-z]/)
    .withMessage("Invalid input")
    .matches(/[0-9]/)
    .withMessage("Invalid input")
    .matches(/[@$!%*?&#]/)
    .withMessage("Invalid input"),
  resetPassword
);

module.exports = router;
