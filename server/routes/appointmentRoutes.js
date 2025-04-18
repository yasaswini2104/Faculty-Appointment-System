
const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createAppointment);

router.route('/me')
  .get(protect, getMyAppointments);

router.route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, updateAppointmentStatus);

module.exports = router;
