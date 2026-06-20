//  services/PasswordResetService.js
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");

const RESET_TOKEN_EXPIRY = process.env.RESET_TOKEN_EXPIRY || 15 * 60 * 1000;

class PasswordResetService {
  static async generateResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid password reset request");

    await PasswordReset.deleteMany({ userId: user._id });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    const hashedToken = await bcrypt.hash(resetToken, 10);

    await PasswordReset.create({ userId: user._id, resetToken: hashedToken, expiresAt });

    return resetToken;
  }

  static async verifyResetToken(token) {
    const resetRequest = await PasswordReset.findOne({ expiresAt: { $gt: new Date() } });

    if (!resetRequest) {
      throw new Error("Invalid password reset request");
    }

    const isValid = await bcrypt.compare(token, resetRequest.resetToken);
    if (!isValid) {
      throw new Error("Invalid password reset request");
    }

    return resetRequest.userId;
  }
}

module.exports = PasswordResetService;
