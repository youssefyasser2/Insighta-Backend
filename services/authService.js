const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const tokenService = require("./tokenService");

require("dotenv").config();

class AuthService {
  static async register(name, email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Invalid authentication request");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    return newUser;
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid authentication request");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid authentication request");

    const accessToken = tokenService.generateAccessToken(user._id);
    const refreshToken = tokenService.generateRefreshToken(user._id);

    return { accessToken, refreshToken, user };
  }
}

module.exports = AuthService;
