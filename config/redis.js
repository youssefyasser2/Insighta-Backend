const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    console.warn(` Redis reconnect attempt #${times}`);
    return Math.min(times * 100, 3000);
  },
  enableReadyCheck: true,
});

redisClient.on("error", (err) => {
  console.error(" Redis connection error:", err.message);
});

redisClient.on("connect", () => {
  console.log(" Connected to Redis successfully!");
});

redisClient.on("reconnecting", (times) => {
  console.warn(` Redis is trying to reconnect... (attempt #${times})`);
});

redisClient.on("ready", () => {
  console.log(" Redis is ready to accept commands!");
});

module.exports = redisClient;
