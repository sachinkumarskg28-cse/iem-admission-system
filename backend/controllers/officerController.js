const dataService = require('../services/dataService');
const { sendEmail } = require('../utils/emailService');
const { recordAudit } = require('../middleware/auditMiddleware');

// @desc    Get applications list for officer
// @route   GET /api/officer/applications
// @access  Private (Officer, Admin)
exports.getApplications = async (req, res, next) => {
  try {
    const { status, courseId, search, page = 1, limit = 10 } = req.query;

    let apps = await dataService.getApplications();

    if (status) {
      apps = apps.filter((a) => a.status === status);
    }
    if (courseId) {
      apps = apps.filter((a) => (a.course?._id || a.course)?.toString() === courseId);
    }
    if (search) {
      const s = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.applicationNumber?.toLowerCase().includes(s) ||
          a.user?.name?.toLowerCase().includes(s) ||
          a.user?.email?.toLowerCase().includes(s) ||
          a.course?.name?.toLowerCase().includes(s)
      );
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = apps.length;
    const paginated = apps.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      applications: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify document
// @route   PUT /api/officer/documents/:id/verify
// @access  Private (Officer, Admin)
exports.verifyDocument = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const document = await dataService.updateDocument(req.params.id, {
      status,
      verificationRemarks: remarks || '',
      verifiedBy: req.user.id || req.user._id,
      verifiedAt: new Date(),
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    await recordAudit(req, {
      action: `DOCUMENT_${status}`,
      module: 'DOCUMENT',
      details: { documentId: document._id, status, remarks },
    });

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}.`,
      document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/officer/applications/:id/status
// @access  Private (Officer, Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks, rejectionReason } = req.body;
    const application = await dataService.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const timelineEntry = {
      status,
      actorName: req.user.name,
      role: req.user.role,
      comment: remarks || (status === 'REJECTED' ? rejectionReason : `Status updated to ${status}`),
      timestamp: new Date(),
    };

    const updateFields = {
      status,
      assignedOfficer: req.user._id || req.user.id,
      decisionDate: new Date(),
      timelineEntry,
    };
    if (remarks) updateFields.officerRemarks = remarks;
    if (rejectionReason) updateFields.rejectionReason = rejectionReason;
    if (status === 'APPROVED') updateFields.admissionOfferLetterGenerated = true;

    const updatedApp = await dataService.updateApplication(req.params.id, updateFields);

    const studentUserId = (application.user?._id || application.user)?.toString();

    // Create Notification
    await dataService.createNotification({
      recipient: studentUserId,
      title: `Admission Status Update: ${status}`,
      message: `Your application (${application.applicationNumber}) status is now: ${status}. Remarks: ${remarks || rejectionReason || 'None'}`,
      type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO',
      link: `/applications/${application._id}`,
    });

    // Send email
    if (application.user?.email) {
      sendEmail({
        to: application.user.email,
        subject: `IEM Kolkata: Application ${application.applicationNumber} Status: ${status}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0b3b60;">Admission Status Update</h2>
            <p>Dear <strong>${application.user.name}</strong>,</p>
            <p>Your application status has been updated to: <strong>${status}</strong></p>
            <p><strong>Remarks:</strong> ${remarks || rejectionReason || 'No remarks.'}</p>
          </div>
        `,
      });
    }

    await recordAudit(req, {
      action: `APPLICATION_${status}`,
      module: 'APPLICATION',
      details: { applicationId: application._id, newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: `Application status changed to ${status}`,
      application: updatedApp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate report summary
// @route   GET /api/officer/reports
// @access  Private (Officer, Admin)
exports.generateApplicantReport = async (req, res, next) => {
  try {
    const apps = await dataService.getApplications();
    const courses = await dataService.getAllCourses();

    const courseBreakdown = courses.map((course) => {
      const courseApps = apps.filter((a) => (a.course?._id || a.course)?.toString() === course._id.toString());
      const approvedCount = courseApps.filter((a) => ['APPROVED', 'ADMITTED'].includes(a.status)).length;
      return {
        courseName: course.name,
        courseCode: course.courseCode,
        totalSeats: course.totalSeats,
        availableSeats: course.availableSeats,
        applicantCount: courseApps.length,
        approvedCount,
      };
    });

    res.status(200).json({
      success: true,
      report: {
        summary: {
          totalApplications: apps.length,
          approvedApplications: apps.filter((a) => ['APPROVED', 'ADMITTED'].includes(a.status)).length,
          pendingApplications: apps.filter((a) => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length,
          rejectedApplications: apps.filter((a) => a.status === 'REJECTED').length,
        },
        courseBreakdown,
        generatedAt: new Date(),
        generatedBy: req.user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};
