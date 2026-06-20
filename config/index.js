const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const buildMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const requiredParts = ["MONGO_USER", "MONGO_PASS", "MONGO_HOST", "MONGO_PORT", "MONGO_DB"];
  const missingParts = requiredParts.filter((name) => !process.env[name]);
  if (missingParts.length) {
    return null;
  }

  const user = encodeURIComponent(process.env.MONGO_USER);
  const password = encodeURIComponent(process.env.MONGO_PASS);
  const host = process.env.MONGO_HOST;
  const port = process.env.MONGO_PORT;
  const database = process.env.MONGO_DB;

  return `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=${database}&retryWrites=true&w=majority`;
};

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "*",
  jsonLimit: process.env.JSON_LIMIT || "10kb",
  mongoURI: buildMongoUri(),
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || process.env.TOKEN_EXPIRATION || "1h",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
  },
};

const validateConfig = () => {
  const required = ["jwtAccessSecret", "jwtRefreshSecret", "mongoURI"];
  const missing = required.filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }
};

module.exports = { ...config, validateConfig };
