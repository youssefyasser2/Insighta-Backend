//  generateSecrets.js
const crypto = require("crypto");

const generateSecret = () => crypto.randomBytes(64).toString("hex");

console.log("JWT_SECRET =", generateSecret());
console.log("JWT_ACCESS_SECRET =", generateSecret());
console.log("JWT_REFRESH_SECRET =", generateSecret());




// TODO run : node generateSecrets.js
