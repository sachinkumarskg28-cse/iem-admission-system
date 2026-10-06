const dataService = require('../services/dataService');
const memoryDB = require('../config/inMemoryDB');
const { recordAudit } = require('../middleware/auditMiddleware');

// @desc    Dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dataService.getAdminDashboardMetrics();
    const apps = await dataService.getApplications();
    const courses = await dataService.getAllCourses();

    const courseStats = courses.map((c) => {
      const cApps = apps.filter((a) => (a.course?._id || a.course)?.toString() === c._id.toString());
      return {
        courseId: c._id,
        courseName: c.name,
        courseCode: c.courseCode,
        department: c.department,
        totalSeats: c.totalSeats,
        availableSeats: c.availableSeats,
        totalApplications: cApps.length,
        admittedCount: cApps.filter((a) => ['APPROVED', 'ADMITTED'].includes(a.status)).length,
      };
    });

    const monthlyTrends = [
      { month: 1, monthName: 'Jan', year: 2026, total: 14, approved: 10 },
      { month: 2, monthName: 'Feb', year: 2026, total: 28, approved: 22 },
      { month: 3, monthName: 'Mar', year: 2026, total: 35, approved: 28 },
      { month: 4, monthName: 'Apr', year: 2026, total: 42, approved: 34 },
      { month: 5, monthName: 'May', year: 2026, total: 60, approved: 48 },
      { month: 6, monthName: 'Jun', year: 2026, total: 85, approved: 68 },
    ];

    const recentActivity = await dataService.getAuditLogs();

    res.status(200).json({
      success: true,
      stats,
      courseStats,
      monthlyTrends,
      recentActivity: recentActivity.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
exports.getAllStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    let users = memoryDB.users.filter((u) => u.role === 'student');

    if (search) {
      const s = search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }

    const students = users.map((u) => {
      const profile = memoryDB.students.find((st) => (st.user?._id || st.user)?.toString() === u._id.toString());
      return { user: u, profile: profile || null };
    });

    res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student/user status
// @route   PUT /api/admin/students/:userId/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await dataService.findUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await dataService.updateUser(req.params.userId, { isActive: !user.isActive });

    await recordAudit(req, {
      action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      module: 'ADMIN',
      details: { targetUserId: updated._id, email: updated.email },
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${updated.isActive ? 'Active' : 'Inactive'}.`,
      isActive: updated.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get officers
// @route   GET /api/admin/officers
// @access  Private (Admin)
exports.getAllOfficers = async (req, res, next) => {
  try {
    const officers = memoryDB.users.filter((u) => u.role === 'officer');
    res.status(200).json({
      success: true,
      count: officers.length,
      officers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create admission officer
// @route   POST /api/admin/officers
// @access  Private (Admin)
exports.createOfficer = async (req, res, next) => {
  try {
    const { name, email, password, phone, department } = req.body;
    const existing = await dataService.findUserByEmail(email);

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const officer = await dataService.createUser({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      department: department || 'School of Engineering & Technology',
      role: 'officer',
    });

    await recordAudit(req, {
      action: 'OFFICER_CREATED',
      module: 'ADMIN',
      details: { officerId: officer._id, email: officer.email },
    });

    res.status(201).json({
      success: true,
      message: 'Admission Officer created successfully.',
      officer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admission cycles
// @route   GET /api/admin/admission-cycles
// @access  Private (Admin, Officer)
exports.getAdmissionCycles = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      cycles: memoryDB.admissionCycles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/update cycle
// @route   POST /api/admin/admission-cycles
// @access  Private (Admin)
exports.createOrUpdateCycle = async (req, res, next) => {
  try {
    const { cycleCode, title, academicYear, startDate, endDate, applicationFee, announcement } = req.body;
    const existing = memoryDB.admissionCycles.find((c) => c.cycleCode === cycleCode);

    if (existing) {
      Object.assign(existing, req.body);
    } else {
      memoryDB.admissionCycles.push({
        _id: `cycle-${Date.now()}`,
        cycleCode,
        title,
        academicYear: academicYear || '2026-2027',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        applicationFee: applicationFee || 2000,
        isActive: true,
        announcement,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admission cycle saved successfully.',
      cycle: existing || memoryDB.admissionCycles[memoryDB.admissionCycles.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { module: mod } = req.query;
    const logs = await dataService.getAuditLogs(mod);

    res.status(200).json({
      success: true,
      total: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DATABASE ACCESS PANEL ====================

// @desc    Get all database collections summary
// @route   GET /api/admin/database/collections
// @access  Private (Admin, Super Admin)
exports.getDatabaseCollections = async (req, res, next) => {
  try {
    const collections = await dataService.getDatabaseCollectionsSummary();
    res.status(200).json({
      success: true,
      collections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get records from collection with search & filter
// @route   GET /api/admin/database/:collection
// @access  Private (Admin, Super Admin)
exports.getDatabaseRecords = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const { search = '' } = req.query;
    const records = await dataService.getCollectionRecords(collection, search);

    res.status(200).json({
      success: true,
      collection,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a record in collection
// @route   POST /api/admin/database/:collection
// @access  Private (Admin, Super Admin)
exports.createDatabaseRecord = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const created = await dataService.createCollectionRecord(collection, req.body);

    await recordAudit(req, {
      action: 'DB_RECORD_CREATED',
      module: 'DATABASE_PANEL',
      details: { collection, recordId: created._id },
    });

    res.status(201).json({
      success: true,
      message: `Record created successfully in collection '${collection}'.`,
      record: created,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a record in collection
// @route   PUT /api/admin/database/:collection/:id
// @access  Private (Admin, Super Admin)
exports.updateDatabaseRecord = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const updated = await dataService.updateCollectionRecord(collection, id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found in collection.' });
    }

    await recordAudit(req, {
      action: 'DB_RECORD_UPDATED',
      module: 'DATABASE_PANEL',
      details: { collection, recordId: id },
    });

    res.status(200).json({
      success: true,
      message: `Record updated successfully in collection '${collection}'.`,
      record: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a record from collection
// @route   DELETE /api/admin/database/:collection/:id
// @access  Private (Admin, Super Admin)
exports.deleteDatabaseRecord = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const deleted = await dataService.deleteCollectionRecord(collection, id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found or could not be deleted.' });
    }

    await recordAudit(req, {
      action: 'DB_RECORD_DELETED',
      module: 'DATABASE_PANEL',
      details: { collection, recordId: id },
    });

    res.status(200).json({
      success: true,
      message: `Record ${id} removed successfully from collection '${collection}'.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export collection records as CSV
// @route   GET /api/admin/database/:collection/export
// @access  Private (Admin, Super Admin)
exports.exportDatabaseRecords = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const records = await dataService.getCollectionRecords(collection);

    if (!records || records.length === 0) {
      return res.status(200).send('No records found');
    }

    // Convert to CSV
    const sample = records[0];
    const headers = Object.keys(sample).filter((k) => typeof sample[k] !== 'object' || sample[k] instanceof Date);
    
    let csv = headers.join(',') + '\n';
    records.forEach((row) => {
      const line = headers
        .map((h) => {
          let val = row[h];
          if (val instanceof Date) val = val.toISOString();
          if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
          return val !== undefined && val !== null ? val : '';
        })
        .join(',');
      csv += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="iem_${collection}_export_${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Accounts financial summary
// @route   GET /api/admin/accounts-summary
// @access  Private (Admin, Super Admin, Accounts)
exports.getAccountsSummary = async (req, res, next) => {
  try {
    const metrics = await dataService.getAdminDashboardMetrics();
    const payments = await dataService.getAllPayments();

    res.status(200).json({
      success: true,
      metrics: {
        totalRevenue: metrics.totalRevenue,
        pendingRevenue: metrics.pendingRevenue,
        successfulTransactions: metrics.successfulTransactions,
        paymentMethodBreakdown: metrics.paymentMethodBreakdown,
      },
      recentPayments: payments.slice(0, 15),
    });
  } catch (error) {
    next(error);
  }
};
