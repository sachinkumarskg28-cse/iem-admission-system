const dataService = require('../services/dataService');
const { generateApplicationPDF } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/emailService');
const { recordAudit } = require('../middleware/auditMiddleware');

// @desc    Create or update application draft
// @route   POST /api/applications/draft
// @access  Private (Student)
exports.createOrUpdateDraft = async (req, res, next) => {
  try {
    const { applicationId, courseId, currentStep } = req.body;
    const userId = req.user._id || req.user.id;

    let student = await dataService.getStudentByUserId(userId);
    if (!student) {
      student = await dataService.createStudentProfile(userId);
    }

    let application;
    if (applicationId) {
      application = await dataService.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application draft not found.' });
      }
      application = await dataService.updateApplication(applicationId, {
        ...(courseId && { course: courseId }),
        ...(currentStep && { currentStep }),
      });
    } else {
      if (!courseId) {
        return res.status(400).json({ success: false, message: 'Course ID is required.' });
      }

      application = await dataService.createApplication({
        user: userId,
        student: student._id || student.id,
        course: courseId,
        currentStep: currentStep || 1,
        status: 'DRAFT',
      });
    }

    const populated = await dataService.getApplicationById(application._id);

    res.status(200).json({
      success: true,
      message: 'Draft application saved successfully.',
      application: populated || application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit application
// @route   POST /api/applications/:id/submit
// @access  Private (Student)
exports.submitApplication = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const application = await dataService.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Application has already been submitted (Current status: ${application.status}).`,
      });
    }

    const student = await dataService.getStudentByUserId(userId);

    let meritScore = 0;
    if (student?.academics?.class12?.pcmPercentage) {
      meritScore = student.academics.class12.pcmPercentage;
    } else if (student?.academics?.class12?.percentage) {
      meritScore = student.academics.class12.percentage;
    } else if (student?.academics?.class10?.percentage) {
      meritScore = student.academics.class10.percentage;
    }

    const timelineEntry = {
      status: 'SUBMITTED',
      actorName: req.user.name,
      role: 'student',
      comment: 'Application submitted for official scrutiny.',
      timestamp: new Date(),
    };

    const updated = await dataService.updateApplication(application._id, {
      status: 'SUBMITTED',
      currentStep: 6,
      submissionDate: new Date(),
      meritScore,
      timelineEntry,
    });

    await dataService.createNotification({
      recipient: userId,
      title: 'Application Submitted Successfully',
      message: `Your application (${updated.applicationNumber}) has been submitted for scrutiny.`,
      type: 'SUCCESS',
      link: `/applications/${updated._id}`,
    });

    sendEmail({
      to: req.user.email,
      subject: `IEM Kolkata: Application Received (${updated.applicationNumber})`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0b3b60;">Application Submission Confirmation</h2>
          <p>Dear <strong>${req.user.name}</strong>,</p>
          <p>We are pleased to inform you that your admission application for <strong>${application.course?.name || 'IEM Degree Program'}</strong> has been received.</p>
          <p><strong>Application Number:</strong> ${updated.applicationNumber}</p>
          <p>Our scrutiny committee will verify your uploaded certificates shortly.</p>
          <p>Warm regards,<br><strong>IEM Admission Directorate</strong></p>
        </div>
      `,
    });

    await recordAudit(req, {
      action: 'APPLICATION_SUBMITTED',
      module: 'APPLICATION',
      details: { applicationId: updated._id, applicationNumber: updated.applicationNumber },
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully.',
      application: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications of current student
// @route   GET /api/applications/my
// @access  Private (Student)
exports.getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const allApps = await dataService.getApplications();
    const myApps = allApps.filter((a) => (a.user?._id || a.user)?.toString() === userId.toString());

    res.status(200).json({
      success: true,
      count: myApps.length,
      applications: myApps,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await dataService.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const userId = req.user._id || req.user.id;
    const appUserId = (application.user?._id || application.user)?.toString();

    if (req.user.role === 'student' && appUserId !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this application.' });
    }

    const documents = await dataService.getDocuments({ user: appUserId });

    res.status(200).json({
      success: true,
      application,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Application Form as PDF
// @route   GET /api/applications/:id/download-pdf
// @access  Private
exports.downloadApplicationPDF = async (req, res, next) => {
  try {
    const application = await dataService.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=IEM_Application_${application.applicationNumber || application._id}.pdf`
    );

    generateApplicationPDF(application, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Track application status publicly
// @route   GET /api/applications/track/:applicationNumber
// @access  Public
exports.trackStatus = async (req, res, next) => {
  try {
    const allApps = await dataService.getApplications();
    const app = allApps.find(
      (a) => a.applicationNumber?.toUpperCase() === req.params.applicationNumber.toUpperCase()
    );

    if (!app) {
      return res.status(404).json({
        success: false,
        message: `No application found with number: ${req.params.applicationNumber}`,
      });
    }

    res.status(200).json({
      success: true,
      application: {
        applicationNumber: app.applicationNumber,
        status: app.status,
        submissionDate: app.submissionDate,
        course: app.course,
        timeline: app.timeline,
        officerRemarks: app.officerRemarks,
        decisionDate: app.decisionDate,
      },
    });
  } catch (error) {
    next(error);
  }
};
