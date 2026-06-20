const mongoose = require("mongoose");

const autoDeleteAfterDays = 90;

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "UPDATE_PROFILE",
        "DELETE_ACCOUNT",
        "PASSWORD_UPDATE",
        "FAILED_LOGIN",
      ],
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },
    message: {
      type: String,
      maxlength: 1000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: { expires: autoDeleteAfterDays * 24 * 60 * 60 },
    },
  },
  { timestamps: true }
);

logSchema.index({ userId: 1, timestamp: -1 });

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
