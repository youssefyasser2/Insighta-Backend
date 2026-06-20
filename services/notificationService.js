const Notification = require("../models/Notification");

class NotificationService {
  static async createNotification(userId, title, message, type) {
    const newNotification = new Notification({
      userId,
      title,
      message,
      type,
    });
    await newNotification.save();
    return newNotification;
  }

  static async getUserNotifications(userId) {
    const notifications = await Notification.find({ userId })
      .sort({ timestamp: -1 })
      .exec();
    return notifications;
  }

  static async markNotificationsAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  static async clearAllNotifications(userId) {
    await Notification.deleteMany({ userId });
  }
}

module.exports = NotificationService;
