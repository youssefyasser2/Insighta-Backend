const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/otpController");

router.post(
  "/request",
  body("Invalid input"),
  requestOTP
);

router.post(
  "/verify",
  body("Invalid input"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid input"),
  verifyOTP
);

router.post(
  "/reset-password",
  body("Invalid input"),
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
