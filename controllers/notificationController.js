const NotificationService = require("../services/notificationService");


const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const userId = req.user.userId;

    if (!title || !message || !type) {
      return res.status(400).json({ message: "Invalid notification request" });
    }

    const newNotification = await NotificationService.createNotification(
      userId,
      title,
      message,
      type
    );
    res.status(201).json({
      message: "Invalid notification request",
      notification: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Invalid notification request",
      error: error.message,
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(
      req.user.userId
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Invalid notification request",
      error: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    await NotificationService.markNotificationsAsRead(req.user.userId);
    res.json({ message: "Invalid notification request" });
  } catch (error) {
    res.status(500).json({
      message: "Invalid notification request",
      error: error.message,
    });
  }
};

const clearNotifications = async (req, res) => {
  try {
    await NotificationService.clearAllNotifications(req.user.userId);
    res.json({ message: "Invalid notification request" });
  } catch (error) {
    res.status(500).json({
      message: "Invalid notification request",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  clearNotifications,
};
