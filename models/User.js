const mongoose = require("mongoose");
const validator = require("validator");
const { isValidPhoneNumber } = require("libphonenumber-js");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return isValidPhoneNumber(v, "EG");
        },
        message: "Invalid phone number for Egypt",
      },
    },
    avatar: {
      type: String,
      validate: {
        validator: (v) =>
          !v ||
          validator.isURL(v, {
            protocols: ["http", "https"],
            require_protocol: true,
          }),
        message: "Avatar must be a valid URL",
      },
    },
    bio: {
      type: String,
      maxlength: 300,
    },
    location: { type: String, default: "" },
    website: {
      type: String,
      validate: {
        validator: (v) =>
          !v ||
          validator.isURL(v, {
            protocols: ["http", "https"],
            require_protocol: true,
          }),
        message: "Invalid website URL",
      },
    },
    socialLinks: {
      twitter: {
        type: String,
        validate: {
          validator: (v) =>
            !v || /^https:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/.test(v),
          message: "Invalid Twitter URL",
        },
      },
      linkedin: {
        type: String,
        validate: {
          validator: (v) =>
            !v ||
            /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(v),
          message: "Invalid LinkedIn URL",
        },
      },
    },
    isVerified: { type: Boolean, default: false },
    authCredential: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthCredential",
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

const User = mongoose.model("User", UserSchema);
module.exports = User;
