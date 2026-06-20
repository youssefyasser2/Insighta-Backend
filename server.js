const app = require("./app");
const config = require("./config");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

let server;

const shutdown = async (signal) => {
  logger.info(`${signal} received. Closing HTTP server.`);
  if (server) {
    server.close(() => process.exit(0));
    return;
  }
  process.exit(0);
};

const start = async () => {
  config.validateConfig();
  await connectDB();
  server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });
};

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled promise rejection", { error });
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
