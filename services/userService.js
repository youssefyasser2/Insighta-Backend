const User = require("../models/User");

class UserService {
  static async getAllUsers() {
    return await User.find().select("-password");
  }

  static async getUserById(userId) {
    return await User.findById(userId).select("-password");
  }
}

module.exports = UserService;
