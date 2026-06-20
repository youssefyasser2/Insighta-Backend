const Log = require("../models/Log");
const mongoose = require("mongoose");

const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, action, status, startDate, endDate } = req.query;

    const filter = {};

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    if (userId) filter.userId = mongoose.Types.ObjectId(userId);
    if (action) filter.action = action;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate)) {
          return res.status(400).json({ message: "Invalid log request" });
        }
        filter.createdAt.$gte = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate)) {
          return res.status(400).json({ message: "Invalid log request" });
        }
        filter.createdAt.$lte = parsedEndDate;
      }
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Invalid log request" });
    }

    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalLogs = await Log.countDocuments(filter);

    if (logs.length === 0) {
      return res.status(404).json({
        message: "Invalid log request",
        filterApplied: filter
      });
    }

    res.json({
      totalLogs,
      totalPages: Math.ceil(totalLogs / limitNumber),
      currentPage: pageNumber,
      logs,
    });
  } catch (error) {
    console.error(" Error fetching logs:", error);
    res.status(500).json({ message: "Invalid log request", error: error.message });
  }
};

module.exports = { getLogs };
