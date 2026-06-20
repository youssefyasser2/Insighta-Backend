const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const asyncHandler = require("express-async-handler");
const path = require("path");
const User = require(path.resolve(__dirname, "../models/User"));
const EmailUtils = require("../utils/emailUtils");
const AuthCredential = require(path.resolve(
  __dirname,
  "../models/AuthCredential"
));
const redisClient = require(path.resolve(__dirname, "../config/redis"));

require("dotenv").config();

const router = express.Router();

//  Rate limiting to prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: { message: "Too many login attempts, please try again later." },
});

//  API Health Check
router.get("/", (req, res) => {
  res.json({ message: "Auth API is working!" });
});

const crypto = require("crypto");

//  User Registration
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
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

    const { name, email, password } = req.body;

    //  Check if user already exists
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already registered" });
    }

    //  Create new user
    const newUser = await new User({ name, email }).save();

    //  Create authentication credentials
    const authCredential = new AuthCredential({
      userId: newUser._id,
      password,
    });

    await authCredential.save();

    await EmailUtils.sendWelcomeEmail(email, name);

    const otp = crypto.randomInt(100000, 999999).toString();
    await redisClient.set(`verify:${email}`, otp, "EX", 15 * 60);

    await EmailUtils.sendVerificationEmail(email, otp);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  })
);

router.post(
  "/verify-email",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("Invalid verification code"),
  ],
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const storedOtp = await redisClient.get(`verify:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });

    await redisClient.del(`verify:${email}`);

    res.json({ success: true, message: "Email verified successfully!" });
  })
);

//  User Login
router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
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

    const { email, password } = req.body;

    //  Find user
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.warn(` Login failed: User not found - Email: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email first.",
      });
    }

    const auth = await AuthCredential.findOne({ userId: user._id })
      .select("+password")
      .lean();

    if (!auth || !auth.password) {
      console.warn(` Login failed: No password found for user ${user._id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //  Validate password
    const isPasswordValid = await bcrypt.compare(password, auth.password);
    if (!isPasswordValid) {
      console.warn(` Login failed: Incorrect password - UserID: ${user._id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //  Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
    );

    //  Store `refreshToken` in Redis
    let redisSuccess = false;
    try {
      if (!redisClient.status || redisClient.status !== "ready") {
        console.warn(" Redis is not connected, attempting to reconnect...");
        await redisClient.connect();
      }

      await redisClient.set(
        `refreshToken:${user._id}`,
        refreshToken,
        "EX",
        7 * 24 * 60 * 60
      );
      console.log(` Refresh token stored in Redis for user ${user._id}`);
      redisSuccess = true;
    } catch (error) {
      console.error(" Redis error:", error);
    } finally {
      if (!redisSuccess) {
        console.warn(` Refresh token NOT stored for user ${user._id}`);
      }
    }

    //  Set `refreshToken` in cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
    });
  })
);

//  Logout with session verification
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        console.warn(" Logout failed: No refresh token found in cookies.");
        return res.status(400).json({
          success: false,
          message: "No active session found.",
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const userId = decoded.userId;

      //  Check if the token exists in Redis
      const storedToken = await redisClient.get(`refreshToken:${userId}`);

      if (!storedToken) {
        console.warn(
          ` Logout attempted, but no token found for user ${userId}`
        );
        return res.status(400).json({
          success: false,
          message: "Session already expired or invalid.",
        });
      }

      //  Remove the token from Redis
      await redisClient.del(`refreshToken:${userId}`);
      console.log(` Refresh token deleted for user ${userId}`);

      //  Delete all session in redis
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error(" Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  })
);

module.exports = router;
