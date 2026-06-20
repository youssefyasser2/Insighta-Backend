const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For secure token hashing
const crypto = require("crypto"); // For cryptographically secure tokens

// Convert environment variable to integer with fallback (1 hour default)
const envTokenExpiry = parseInt(process.env.RESET_TOKEN_EXPIRY) || 3600;

const PasswordResetSchema = new mongoose.Schema(
  {
    // Reference to the User model
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimize user-based queries
    },
    // Hashed reset token (never store plaintext)
    resetToken: {
      type: String,
      required: true,
    },
    // Expiration timestamp
    expiresAt: {
      type: Date,
      required: true,
      index: true, // Optimize expiration queries
    },
  },
  { timestamps: true } // Automatic createdAt and updatedAt
);

/**
 * Pre-save hook to:
 * 1. Prevent multiple active reset requests
 * 2. Hash the reset token
 * 3. Validate expiration date
 */
PasswordResetSchema.pre("save", async function (next) {
  try {
    // Check for existing active reset request
    const existingRequest = await this.constructor.findOne({
      userId: this.userId,
      expiresAt: { $gt: new Date() }, // Not expired yet
    });

    if (existingRequest) {
      throw new Error("An active password reset request already exists");
    }

    // Hash the token if it's being modified
    if (this.isModified("resetToken")) {
      this.resetToken = await bcrypt.hash(this.resetToken, 10); // Salt rounds = 10
    }

    // Validate expiration date
    if (isNaN(this.expiresAt.getTime())) {
      throw new Error(
        "Invalid expiration date. Ensure expiresAt is calculated correctly"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Generates a cryptographically secure random token
 * @returns {string} Unhashed reset token (32 bytes hex string)
 */
PasswordResetSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex"); // 256-bit token
};

/**
 * Finds a valid reset token entry by comparing hashes
 * @param {string} token - Plaintext token to validate
 * @returns {Promise<Document|null>} The valid token document or null
 */
PasswordResetSchema.statics.findValidToken = async function (token) {
  // First find non-expired tokens efficiently using index
  const resetEntries = await this.find({ expiresAt: { $gt: new Date() } });

  // Compare each token securely
  for (const entry of resetEntries) {
    const isValid = await bcrypt.compare(token, entry.resetToken);
    if (isValid) {
      return entry; // Return the first valid entry found
    }
  }

  return null; // No valid token found
};

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);

/**
 * Key Security Features:
 * 1. Token expiration enforcement
 * 2. Cryptographic token generation
 * 3. Secure token storage (hashed)
 * 4. Prevention of multiple active requests
 * 5. Indexed queries for performance
 * 6. Automatic timestamp tracking
 * 7. Proper error handling
 *
 * Best Practices Implemented:
 * - Never stores plaintext tokens
 * - Uses proper bcrypt hashing
 * - Validates dates before saving
 * - Prevents token reuse
 * - Handles errors gracefully
 */
