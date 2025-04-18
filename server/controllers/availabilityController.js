
const Availability = require('../models/availabilityModel');
const User = require('../models/userModel');

// @desc    Create faculty availability
// @route   POST /api/availability
// @access  Private/Faculty
const createAvailability = async (req, res) => {
  const { dayOfWeek, startTime, endTime, isRecurring, date } = req.body;

  // Validate inputs
  if (!dayOfWeek || !startTime || !endTime) {
    res.status(400);
    throw new Error('Please provide day, start time and end time');
  }

  // If not recurring, date is required
  if (!isRecurring && !date) {
    res.status(400);
    throw new Error('Date is required for non-recurring availability');
  }

  const availability = await Availability.create({
    faculty: req.user._id,
    dayOfWeek,
    startTime,
    endTime,
    isRecurring,
    date: !isRecurring ? date : undefined,
  });

  if (availability) {
    res.status(201).json(availability);
  } else {
    res.status(400);
    throw new Error('Invalid availability data');
  }
};

// @desc    Get faculty availability by faculty ID
// @route   GET /api/availability/faculty/:id
// @access  Public
const getAvailabilityByFaculty = async (req, res) => {
  const facultyId = req.params.id;
  
  // Check if faculty exists
  const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }

  const availability = await Availability.find({ faculty: facultyId });
  res.json(availability);
};

// @desc    Get own availability
// @route   GET /api/availability/me
// @access  Private/Faculty
const getMyAvailability = async (req, res) => {
  if (req.user.role !== 'faculty') {
    res.status(403);
    throw new Error('Only faculty can access their availability');
  }

  const availability = await Availability.find({ faculty: req.user._id });
  res.json(availability);
};

// @desc    Update availability
// @route   PUT /api/availability/:id
// @access  Private/Faculty
const updateAvailability = async (req, res) => {
  const availability = await Availability.findById(req.params.id);

  if (!availability) {
    res.status(404);
    throw new Error('Availability not found');
  }

  // Check if the availability belongs to the logged in faculty
  if (availability.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this availability');
  }

  const { dayOfWeek, startTime, endTime, isRecurring, date } = req.body;

  availability.dayOfWeek = dayOfWeek || availability.dayOfWeek;
  availability.startTime = startTime || availability.startTime;
  availability.endTime = endTime || availability.endTime;
  
  if (isRecurring !== undefined) {
    availability.isRecurring = isRecurring;
  }
  
  if (!availability.isRecurring && date) {
    availability.date = date;
  }

  const updatedAvailability = await availability.save();
  res.json(updatedAvailability);
};

// @desc    Delete availability
// @route   DELETE /api/availability/:id
// @access  Private/Faculty
const deleteAvailability = async (req, res) => {
  const availability = await Availability.findById(req.params.id);

  if (!availability) {
    res.status(404);
    throw new Error('Availability not found');
  }

  // Check if the availability belongs to the logged in faculty
  if (availability.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this availability');
  }

  await availability.deleteOne();
  res.json({ message: 'Availability removed' });
};

module.exports = {
  createAvailability,
  getAvailabilityByFaculty,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
};
