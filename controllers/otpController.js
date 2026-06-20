const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const OtpCode = require("../models/otpCode");
const User = require("../models/User");
const AuthCredential = require("../models/AuthCredential");
const EmailUtils = require("../utils/emailUtils.js");

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY) || 300;

exports.requestOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid OTP request" });
    }

    const otp = OtpCode.generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 1000);

    await OtpCode.create({ userId: user._id, otp, expiresAt });
    await EmailUtils.sendEmail(user.email, "Your verification code", `Your verification code is: ${otp}`);

    res.status(200).json({ message: "OTP request completed" });
  } catch (error) {
    res.status(500).json({ message: "Invalid OTP request", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid OTP request" });

    const validEntry = await OtpCode.findValidOTP(user._id, otp);
    if (!validEntry) return res.status(400).json({ message: "Invalid OTP request" });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Invalid OTP request", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Invalid OTP request" });
    }
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}/.test(newPassword)) {
      return res.status(400).json({ message: "Invalid OTP request" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid OTP request" });

    const validEntry = await OtpCode.findValidOTP(user._id, otp);
    if (!validEntry) return res.status(400).json({ message: "Invalid OTP request" });

    const auth = await AuthCredential.findOne({ userId: user._id }).select("+password");
    if (auth && (await bcrypt.compare(newPassword, auth.password))) {
      return res.status(400).json({ message: "Invalid OTP request" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await AuthCredential.findOneAndUpdate(
      { userId: user._id },
      { password: hashedPassword },
      { new: true }
    );

    await OtpCode.deleteMany({ userId: user._id });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Invalid OTP request", error: error.message });
  }
};
