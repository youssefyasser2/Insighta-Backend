const express = require("express");
const Log = require("../models/Log");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      status,
      startDate,
      endDate,
    } = req.query;

    const filter = { userId: req.user.userId };

    if (action) filter.action = action;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate)) {
          return res.status(400).json({ message: "Invalid log request" });
        }
        filter.timestamp.$gte = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate)) {
          return res.status(400).json({ message: "Invalid log request" });
        }
        filter.timestamp.$lte = parsedEndDate;
      }
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalLogs = await Log.countDocuments(filter);

    res.json({
      totalLogs,
      totalPages: Math.ceil(totalLogs / limitNumber),
      currentPage: pageNumber,
      logs,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Invalid log request", error: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { action, status, message } = req.body;

    if (!action || !status)
      return res
        .status(400)
        .json({ message: "Invalid log request" });

    const newLog = new Log({
      userId: req.user.userId,
      action,
      status,
      message: message || "",
    });

    await newLog.save();
    res.status(201).json({ message: "Invalid log request", log: newLog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Invalid log request", error: error.message });
  }
});

router.delete("/cleanup", authMiddleware, async (req, res) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const result = await Log.deleteMany({
      userId: req.user.userId,
      timestamp: { $lt: cutoffDate },
    });

    res.json({ message: `Invalid log request` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Invalid log request", error: error.message });
  }
});

module.exports = router;
