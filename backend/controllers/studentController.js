const dataService = require('../services/dataService');
const { recordAudit } = require('../middleware/auditMiddleware');

const calculateCompletion = (student) => {
  let score = 20;
  if (student.dob && student.gender && student.bloodGroup) score += 20;
  if (student.guardian?.fatherName) score += 15;
  if (student.address?.present?.city) score += 15;
  if (student.academics?.class10?.percentage && student.academics?.class12?.percentage) score += 20;
  if (student.academics?.entranceExam?.rank || student.academics?.entranceExam?.score) score += 10;
  return Math.min(score, 100);
};

// @desc    Get current student's full profile
// @route   GET /api/student/profile
// @access  Private (Student)
exports.getProfile = async (req, res, next) => {
  try {
    let student = await dataService.getStudentByUserId(req.user._id || req.user.id);
    if (!student) {
      student = await dataService.createStudentProfile(req.user._id || req.user.id);
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile details
// @route   PUT /api/student/profile
// @access  Private (Student)
exports.updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;
    const userId = req.user._id || req.user.id;

    if (updateData.name || updateData.phone) {
      await dataService.updateUser(userId, {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.phone && { phone: updateData.phone }),
      });
    }

    let student = await dataService.getStudentByUserId(userId);
    if (!student) {
      student = await dataService.createStudentProfile(userId);
    }

    const merged = { ...student, ...updateData };
    const percentage = calculateCompletion(merged);
    updateData.completionPercentage = percentage;
    updateData.profileCompleted = percentage >= 75;

    const updatedStudent = await dataService.updateStudentProfile(userId, updateData);

    await recordAudit(req, {
      action: 'PROFILE_UPDATED',
      module: 'STUDENT',
      details: { studentId: updatedStudent.studentId, completionPercentage: percentage },
    });

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student dashboard overview stats
// @route   GET /api/student/dashboard-overview
// @access  Private (Student)
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let student = await dataService.getStudentByUserId(userId);
    if (!student) {
      student = await dataService.createStudentProfile(userId);
    }

    const applications = await dataService.getApplications({ user: userId });
    const documents = await dataService.getDocuments({ user: userId });

    const totalApplications = applications.length;
    const approvedApplications = applications.filter((app) => ['APPROVED', 'ADMITTED'].includes(app.status)).length;
    const underReviewApplications = applications.filter((app) => ['UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(app.status)).length;
    const pendingPaymentApplications = applications.filter((app) => !app.isFeePaid).length;

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          totalApplications,
          approvedApplications,
          underReviewApplications,
          pendingPaymentApplications,
          totalDocumentsUploaded: documents.length,
          verifiedDocumentsCount: documents.filter((d) => d.status === 'VERIFIED').length,
          profileCompletion: student.completionPercentage || 20,
        },
        recentApplications: applications.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};
