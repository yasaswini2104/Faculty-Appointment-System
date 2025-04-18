
const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMyNotifications);

router.route('/read-all')
  .put(protect, markAllNotificationsAsRead);

router.route('/:id')
  .put(protect, markNotificationAsRead);

module.exports = router;
