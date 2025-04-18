
const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getFacultyMembers,
  getFacultyMemberById,
  getUsers,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/register').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.get('/faculty', getFacultyMembers);
router.get('/faculty/:id', getFacultyMemberById);

module.exports = router;
