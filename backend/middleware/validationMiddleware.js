const { validationResult, check } = require('express-validator');

// Middleware to evaluate validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Reusable validation chains
const registerValidation = [
  check('name', 'Full name is required and must be between 2 and 100 characters').trim().isLength({ min: 2, max: 100 }),
  check('email', 'Please provide a valid email address').trim().isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('role', 'Role must be student, officer, or admin').optional().isIn(['student', 'officer', 'admin']),
  check('phone', 'Please provide a valid contact number').optional().isMobilePhone(),
  validate,
];

const loginValidation = [
  check('email', 'Please provide a valid email').trim().isEmail(),
  check('password', 'Password is required').notEmpty(),
  validate,
];

const courseValidation = [
  check('courseCode', 'Course code is required').trim().notEmpty(),
  check('name', 'Course name is required').trim().notEmpty(),
  check('department', 'Department is required').trim().notEmpty(),
  check('totalSeats', 'Total seats must be a positive integer').isInt({ min: 1 }),
  check('eligibilityCriteria', 'Eligibility criteria is required').trim().notEmpty(),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  courseValidation,
};
