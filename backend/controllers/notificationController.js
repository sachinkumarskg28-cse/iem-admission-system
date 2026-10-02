const dataService = require('../services/dataService');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await dataService.getNotificationsForUser(userId, req.user.role);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await dataService.markNotificationAsRead(req.params.id);
    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await dataService.getNotificationsForUser(userId, req.user.role);
    for (const n of notifications) {
      await dataService.markNotificationAsRead(n._id);
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast
// @route   POST /api/notifications/broadcast
// @access  Private (Admin)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetRole = 'all', type = 'ANNOUNCEMENT', link } = req.body;
    const notification = await dataService.createNotification({
      title,
      message,
      targetRole,
      type,
      link,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully.',
      notification,
    });
  } catch (error) {
    next(error);
  }
};
