const bcrypt = require("bcryptjs");

class HashUtils {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePasswords(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = HashUtils;
