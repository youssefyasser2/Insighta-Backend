const express = require("express");
const jwt = require("jsonwebtoken");
const AuthToken = require("../models/AuthToken");
require("dotenv").config();

const router = express.Router();

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const storedToken = await AuthToken.findOne({ refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: storedToken.userId },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || "1h" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Token refresh failed", error);
    res.status(500).json({ message: "Unable to refresh token" });
  }
});

module.exports = router;
