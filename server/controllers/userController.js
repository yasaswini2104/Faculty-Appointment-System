
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      bio: user.bio,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create basic user fields
  const userData = {
    name,
    email,
    password,
    role,
  };

  // Add faculty-specific fields if role is faculty
  if (role === 'faculty') {
    const { department, position, bio } = req.body;
    if (!department || !position) {
      res.status(400);
      throw new Error('Faculty users require department and position');
    }
    userData.department = department;
    userData.position = position;
    userData.bio = bio || '';
  }

  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      bio: user.bio,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      bio: user.bio,
      profileImage: user.profileImage,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    if (user.role === 'faculty') {
      user.department = req.body.department || user.department;
      user.position = req.body.position || user.position;
      user.bio = req.body.bio || user.bio;
    }

    user.profileImage = req.body.profileImage || user.profileImage;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      position: updatedUser.position,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Get all faculty members
// @route   GET /api/users/faculty
// @access  Public
const getFacultyMembers = async (req, res) => {
  const facultyMembers = await User.find({ role: 'faculty' }).select('-password');
  res.json(facultyMembers);
};

// @desc    Get faculty member by ID
// @route   GET /api/users/faculty/:id
// @access  Public
const getFacultyMemberById = async (req, res) => {
  const faculty = await User.findOne({ 
    _id: req.params.id, 
    role: 'faculty' 
  }).select('-password');

  if (faculty) {
    res.json(faculty);
  } else {
    res.status(404);
    throw new Error('Faculty member not found');
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getFacultyMembers,
  getFacultyMemberById,
  getUsers,
};
