const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { courseValidation } = require('../middleware/validationMiddleware');

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Admin-only management
router.post('/', protect, authorize('admin'), courseValidation, createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

module.exports = router;
