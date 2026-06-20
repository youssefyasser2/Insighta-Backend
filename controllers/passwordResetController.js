const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AuthCredential = require("../models/AuthCredential");
const PasswordReset = require("../models/PasswordReset");
const EmailUtils = require("../utils/emailUtils");
const validator = require("validator");

const requestPasswordReset = async (req, res) => {
  try {
    const email = validator.normalizeEmail(req.body.email || "");

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "A valid email address is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    const resetToken = PasswordReset.generateToken();
    const expiresAt = new Date(Date.now() + Number(process.env.RESET_TOKEN_EXPIRY || 15 * 60 * 1000));

    await PasswordReset.deleteMany({ userId: user._id });
    await PasswordReset.create({ userId: user._id, resetToken, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await EmailUtils.sendEmail(
      user.email,
      "Password reset",
      `Use this link to reset your password: ${resetUrl}`
    );

    return res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to request password reset", error: error.message });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const validEntry = await PasswordReset.findValidToken(token);

    if (!validEntry) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    return res.json({ message: "Reset token is valid" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to verify reset token", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const validEntry = await PasswordReset.findValidToken(token);

    if (!validEntry) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (!validator.isStrongPassword(newPassword || "")) {
      return res.status(400).json({ message: "Password does not meet complexity requirements" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await AuthCredential.findOneAndUpdate(
      { userId: validEntry.userId },
      { password: hashedPassword }
    );
    await PasswordReset.deleteMany({ userId: validEntry.userId });

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to reset password", error: error.message });
  }
};

module.exports = { requestPasswordReset, verifyResetToken, resetPassword };
