
const Notification = require('../models/notificationModel');

// @desc    Get notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name')
    .sort({ createdAt: -1 });
  
  res.json(notifications);
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markNotificationAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Ensure notification belongs to the user
  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  notification.read = true;
  const updatedNotification = await notification.save();

  res.json(updatedNotification);
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  res.json({ message: 'All notifications marked as read' });
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
