const mongoose = require("mongoose");
const { mongoURI } = require("./index");
const logger = require("../utils/logger");

const connectDB = async () => {
  if (!mongoURI) {
    throw new Error("MongoDB connection string is not configured");
  }

  const connection = await mongoose.connect(mongoURI, {
    writeConcern: { w: "majority", wtimeout: 5000 },
  });

  logger.info(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error", { error });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

module.exports = connectDB;
