const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AuthCredential = require("../models/AuthCredential");
const AuthToken = require("../models/AuthToken");
const dotenv = require("dotenv");
dotenv.config();

const generateTokens = (userId) => {
  try {
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION || "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(" Token generation error:", error);
    throw new Error("Failed to generate tokens");
  }
};

const register = async (req, res) => {
  try {


    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email });

    const authCredential = new AuthCredential({ userId: user._id, password });

    await Promise.all([user.save(), authCredential.save()]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(" Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const auth = await AuthCredential.findOne({ userId: user._id }).select("+password").lean();
    if (!auth) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user._id);

    await AuthToken.findOneAndUpdate(
      { userId: user._id },
      { refreshToken },
      { upsert: true, new: true }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const token = await AuthToken.findOne({ refreshToken });
      if (token) await AuthToken.deleteOne({ refreshToken });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(" Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, logout };
