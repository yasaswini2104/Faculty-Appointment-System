
const express = require('express');
const router = express.Router();
const {
  createAvailability,
  getAvailabilityByFaculty,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
} = require('../controllers/availabilityController');
const { protect, faculty } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, faculty, createAvailability);

router.route('/me')
  .get(protect, faculty, getMyAvailability);

router.route('/faculty/:id')
  .get(getAvailabilityByFaculty);

router.route('/:id')
  .put(protect, faculty, updateAvailability)
  .delete(protect, faculty, deleteAvailability);

module.exports = router;
