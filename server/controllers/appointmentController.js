
const Appointment = require('../models/appointmentModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Availability = require('../models/availabilityModel');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  const { faculty, date, startTime, endTime, reason } = req.body;

  // Validate faculty exists
  const facultyUser = await User.findOne({ _id: faculty, role: 'faculty' });
  if (!facultyUser) {
    res.status(404);
    throw new Error('Faculty member not found');
  }

  // Format startTime and endTime into Date objects to ensure proper comparison
  const formattedStartTime = new Date(`1970-01-01T${startTime}:00`);
  const formattedEndTime = new Date(`1970-01-01T${endTime}:00`);

  // Check if there's a time conflict with existing appointments
  const conflictingAppointment = await Appointment.findOne({
    faculty,
    date: new Date(date),
    $or: [
      { startTime: { $lte: formattedEndTime }, endTime: { $gte: formattedStartTime } }
    ],
    status: { $in: ['pending', 'approved'] }
  });

  if (conflictingAppointment) {
    res.status(400);
    throw new Error('The faculty member already has an appointment at this time');
  }

  // Check if the time fits in faculty's availability
  const appointmentDate = new Date(date);
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];
  
  const availability = await Availability.findOne({
    faculty,
    $or: [
      {
        isRecurring: true,
        dayOfWeek
      },
      {
        isRecurring: false,
        date: appointmentDate
      }
    ],
    startTime: { $lte: formattedStartTime },
    endTime: { $gte: formattedEndTime }
  });

  if (!availability) {
    res.status(400);
    throw new Error('The selected time is not within faculty availability');
  }

  // Create the appointment
  const appointment = await Appointment.create({
    student: req.user._id,
    faculty,
    date: appointmentDate,
    startTime,
    endTime,
    reason,
    status: 'pending'
  });

  if (appointment) {
    // Create notification for faculty
    await Notification.create({
      recipient: faculty,
      sender: req.user._id,
      type: 'appointment_request',
      content: `${req.user.name} has requested an appointment on ${new Date(date).toLocaleDateString()} at ${startTime}`,
      relatedAppointment: appointment._id
    });

    res.status(201).json(appointment);
  } else {
    res.status(400);
    throw new Error('Invalid appointment data');
  }
};

// @desc    Get all appointments for logged in user (faculty or student)
// @route   GET /api/appointments/me
// @access  Private
const getMyAppointments = async (req, res) => {
  let appointments;
  
  if (req.user.role === 'student') {
    appointments = await Appointment.find({ student: req.user._id })
      .populate('faculty', 'name email department position')
      .sort({ date: 1 });
  } else if (req.user.role === 'faculty') {
    appointments = await Appointment.find({ faculty: req.user._id })
      .populate('student', 'name email')
      .sort({ date: 1 });
  } else if (req.user.role === 'admin') {
    appointments = await Appointment.find({})
      .populate('student', 'name email')
      .populate('faculty', 'name email department position')
      .sort({ date: 1 });
  }

  res.json(appointments);
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('student', 'name email')
    .populate('faculty', 'name email department position');

  if (appointment) {
    // Check if user is authorized to view this appointment
    if (
      req.user.role === 'admin' ||
      appointment.student._id.toString() === req.user._id.toString() ||
      appointment.faculty._id.toString() === req.user._id.toString()
    ) {
      res.json(appointment);
    } else {
      res.status(401);
      throw new Error('Not authorized to view this appointment');
    }
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  const { status, notes } = req.body;
  
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check authorization
  const isFaculty = appointment.faculty.toString() === req.user._id.toString();
  const isStudent = appointment.student.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isFaculty && !isAdmin && !isStudent) {
    res.status(401);
    throw new Error('Not authorized to update this appointment');
  }

  // Faculty or admin can approve/reject
  if ((isFaculty || isAdmin) && (status === 'approved' || status === 'rejected')) {
    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    const updatedAppointment = await appointment.save();
    
    // Create notification for student
    await Notification.create({
      recipient: appointment.student,
      sender: req.user._id,
      type: status === 'approved' ? 'appointment_approved' : 'appointment_rejected',
      content: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime} has been ${status}`,
      relatedAppointment: appointment._id
    });

    res.json(updatedAppointment);
  } 
  // Student or faculty or admin can cancel
  else if ((isStudent || isFaculty || isAdmin) && status === 'canceled') {
    appointment.status = 'canceled';
    if (notes) {
      appointment.notes = notes;
    }

    const updatedAppointment = await appointment.save();
    
    // Create notification
    const recipient = isStudent ? appointment.faculty : appointment.student;
    
    await Notification.create({
      recipient,
      sender: req.user._id,
      type: 'appointment_canceled',
      content: `The appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.startTime} has been canceled`,
      relatedAppointment: appointment._id
    });

    res.json(updatedAppointment);
  }
  // Faculty or admin can mark as completed
  else if ((isFaculty || isAdmin) && status === 'completed') {
    appointment.status = 'completed';
    if (notes) {
      appointment.notes = notes;
    }

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } else {
    res.status(400);
    throw new Error('Invalid status update');
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
