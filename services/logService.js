const Log = require("../models/Log");

class LogService {
  static async createLog(userId, action, status, message = "") {
    if (!userId || !action) {
      throw new Error("Invalid log request");
    }
    const validActions = [
      "LOGIN",
      "LOGOUT",
      "UPDATE_PROFILE",
      "DELETE_ACCOUNT",
      "PASSWORD_UPDATE",
      "FAILED_LOGIN",
    ];
    const validStatuses = ["SUCCESS", "FAILED"];

    if (!validActions.includes(action)) {
      throw new Error("Invalid log request");
    }

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid log request");
    }

    const log = new Log({ userId, action, status, message });
    await log.save();
    return log;
  }

  static async getUserLogs(
    userId,
    { page = 1, limit = 10, action, status, startDate, endDate }
  ) {
    const filter = { userId };

    if (action) filter.action = action;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate)) {
          throw new Error("Invalid log request");
        }
        filter.timestamp.$gte = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate)) {
          throw new Error("Invalid log request");
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

    return {
      totalLogs,
      totalPages: Math.ceil(totalLogs / limitNumber),
      currentPage: pageNumber,
      logs,
    };
  }
}

module.exports = LogService;
