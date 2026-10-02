const dataService = require('../services/dataService');
const { recordAudit } = require('../middleware/auditMiddleware');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res, next) => {
  try {
    const { department, level, search, isActive } = req.query;
    const courses = await dataService.getAllCourses({
      department,
      level,
      search,
      isActive: typeof isActive !== 'undefined' ? isActive === 'true' : true,
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await dataService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const course = await dataService.createCourse(req.body);

    await recordAudit(req, {
      action: 'COURSE_CREATED',
      module: 'COURSE',
      details: { courseId: course._id, courseCode: course.courseCode, name: course.name },
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await dataService.updateCourse(req.params.id, req.body);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await recordAudit(req, {
      action: 'COURSE_UPDATED',
      module: 'COURSE',
      details: { courseId: course._id, courseCode: course.courseCode },
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    await dataService.updateCourse(req.params.id, { isActive: false });

    await recordAudit(req, {
      action: 'COURSE_DEACTIVATED',
      module: 'COURSE',
      details: { courseId: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Course deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
