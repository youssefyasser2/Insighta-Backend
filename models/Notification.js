const mongoose = require("mongoose");

const autoDeleteAfterDays = 30;

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "This field is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },
    message: {
      type: String,
      required: [true, "This field is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
      maxlength: [500, "Message must be at most 500 characters"],
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ["NEW_MESSAGE", "WARNING", "SYSTEM_UPDATE", "ALERT"],
        message: "Invalid notification type",
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      expires: autoDeleteAfterDays * 24 * 60 * 60,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, timestamp: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
