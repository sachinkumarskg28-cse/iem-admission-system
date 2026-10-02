const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDashboardSummary,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/profile', authorize('student'), getProfile);
router.put('/profile', authorize('student'), updateProfile);
router.get('/dashboard-overview', authorize('student'), getDashboardSummary);

module.exports = router;
