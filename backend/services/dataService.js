const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const memoryDB = require('../config/inMemoryDB');

// Mongoose Models
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const AdmissionCycle = require('../models/AdmissionCycle');

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

const generateTokenForUser = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'iem_admission_management_secret_key_2026_super_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ==================== AUTH & USERS ====================
exports.findUserByEmail = async (email, includePassword = false) => {
  if (isMongoConnected()) {
    const q = User.findOne({ email: email.toLowerCase() });
    if (includePassword) q.select('+password');
    return await q;
  }
  const user = memoryDB.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const userCopy = { ...user };
  userCopy.comparePassword = async (pwd) => bcrypt.compare(pwd, user.password);
  userCopy.generateAuthToken = () => generateTokenForUser(user);
  return userCopy;
};

exports.findUserById = async (id) => {
  if (isMongoConnected()) {
    return await User.findById(id).select('-password');
  }
  const user = memoryDB.users.find((u) => (u._id?.toString() || u.id) === id?.toString());
  if (!user) return null;
  const { password, ...safeUser } = user;
  safeUser.generateAuthToken = () => generateTokenForUser(user);
  safeUser.comparePassword = async (pwd) => bcrypt.compare(pwd, password);
  return safeUser;
};

exports.createUser = async (userData) => {
  if (isMongoConnected()) {
    const user = await User.create(userData);
    return user;
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, salt);
  const newUser = {
    _id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...userData,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
  };
  memoryDB.users.push(newUser);
  newUser.generateAuthToken = () => generateTokenForUser(newUser);
  newUser.comparePassword = async (pwd) => bcrypt.compare(pwd, newUser.password);
  return newUser;
};

exports.updateUser = async (id, updateFields) => {
  if (isMongoConnected()) {
    return await User.findByIdAndUpdate(id, updateFields, { new: true });
  }
  const index = memoryDB.users.findIndex((u) => (u._id?.toString() || u.id) === id?.toString());
  if (index !== -1) {
    if (updateFields.password) {
      updateFields.password = bcrypt.hashSync(updateFields.password, 10);
    }
    memoryDB.users[index] = { ...memoryDB.users[index], ...updateFields };
    return memoryDB.users[index];
  }
  return null;
};

// ==================== STUDENTS ====================
exports.getStudentByUserId = async (userId) => {
  if (isMongoConnected()) {
    return await Student.findOne({ user: userId }).populate('user', 'name email phone avatar');
  }
  const student = memoryDB.students.find((s) => (s.user?.toString() || s.user?._id?.toString()) === userId?.toString());
  if (!student) return null;
  const userObj = memoryDB.users.find((u) => u._id.toString() === userId?.toString());
  return { ...student, user: userObj || null };
};

exports.createStudentProfile = async (userId) => {
  if (isMongoConnected()) {
    return await Student.create({ user: userId });
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newStudent = {
    _id: `std-${Date.now()}`,
    user: userId,
    studentId: `IEM-STD-${new Date().getFullYear()}-${randomSuffix}`,
    dob: null,
    gender: 'Male',
    nationality: 'Indian',
    category: 'General',
    guardian: {},
    address: { present: {}, permanent: {} },
    academics: { class10: {}, class12: {}, entranceExam: {} },
    profileCompleted: false,
    completionPercentage: 20,
    createdAt: new Date(),
  };
  memoryDB.students.push(newStudent);
  return newStudent;
};

exports.updateStudentProfile = async (userId, data) => {
  if (isMongoConnected()) {
    let student = await Student.findOne({ user: userId });
    if (!student) student = new Student({ user: userId });
    Object.assign(student, data);
    await student.save();
    return student;
  }
  let index = memoryDB.students.findIndex((s) => s.user.toString() === userId?.toString());
  if (index === -1) {
    const newStudent = await exports.createStudentProfile(userId);
    index = memoryDB.students.findIndex((s) => s._id === newStudent._id);
  }
  memoryDB.students[index] = {
    ...memoryDB.students[index],
    ...data,
    guardian: { ...memoryDB.students[index].guardian, ...(data.guardian || {}) },
    address: { ...memoryDB.students[index].address, ...(data.address || {}) },
    academics: { ...memoryDB.students[index].academics, ...(data.academics || {}) },
  };
  return memoryDB.students[index];
};

// ==================== COURSES ====================
exports.getAllCourses = async (query = {}) => {
  if (isMongoConnected()) {
    return await Course.find(query).sort({ level: 1, name: 1 });
  }
  let list = [...memoryDB.courses];
  if (query.department) list = list.filter((c) => c.department === query.department);
  if (query.level) list = list.filter((c) => c.level === query.level);
  if (typeof query.isActive !== 'undefined') list = list.filter((c) => c.isActive === query.isActive);
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.courseCode.toLowerCase().includes(s) ||
        c.department.toLowerCase().includes(s)
    );
  }
  return list;
};

exports.getCourseById = async (id) => {
  if (isMongoConnected()) {
    return await Course.findById(id);
  }
  return memoryDB.courses.find((c) => c._id.toString() === id.toString()) || null;
};

exports.createCourse = async (courseData) => {
  if (isMongoConnected()) {
    return await Course.create(courseData);
  }
  const newCourse = {
    _id: `crs-${courseData.courseCode.toLowerCase()}`,
    ...courseData,
    createdAt: new Date(),
  };
  memoryDB.courses.push(newCourse);
  return newCourse;
};

exports.updateCourse = async (id, courseData) => {
  if (isMongoConnected()) {
    return await Course.findByIdAndUpdate(id, courseData, { new: true });
  }
  const idx = memoryDB.courses.findIndex((c) => c._id.toString() === id.toString());
  if (idx !== -1) {
    memoryDB.courses[idx] = { ...memoryDB.courses[idx], ...courseData };
    return memoryDB.courses[idx];
  }
  return null;
};

// ==================== APPLICATIONS ====================
exports.getApplications = async (filter = {}) => {
  if (isMongoConnected()) {
    return await Application.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('course')
      .populate('student')
      .populate('payment')
      .sort({ createdAt: -1 });
  }
  return memoryDB.applications
    .map((app) => {
      const userObj = memoryDB.users.find((u) => u._id.toString() === (app.user?._id || app.user)?.toString());
      const courseObj = memoryDB.courses.find((c) => c._id.toString() === (app.course?._id || app.course)?.toString());
      const studentObj = memoryDB.students.find((s) => s._id.toString() === (app.student?._id || app.student)?.toString());
      const paymentObj = memoryDB.payments.find((p) => p._id.toString() === (app.payment?._id || app.payment)?.toString());
      return {
        ...app,
        user: userObj || app.user,
        course: courseObj || app.course,
        student: studentObj || app.student,
        payment: paymentObj || app.payment,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

exports.getApplicationById = async (id) => {
  if (isMongoConnected()) {
    return await Application.findById(id)
      .populate('course')
      .populate('student')
      .populate('user', 'name email phone avatar')
      .populate('assignedOfficer', 'name email department')
      .populate('payment');
  }
  const app = memoryDB.applications.find((a) => a._id.toString() === id.toString());
  if (!app) return null;
  const userObj = memoryDB.users.find((u) => u._id.toString() === (app.user?._id || app.user)?.toString());
  const courseObj = memoryDB.courses.find((c) => c._id.toString() === (app.course?._id || app.course)?.toString());
  const studentObj = memoryDB.students.find((s) => s._id.toString() === (app.student?._id || app.student)?.toString());
  const paymentObj = memoryDB.payments.find((p) => p.application?.toString() === app._id.toString());
  const officerObj = memoryDB.users.find((u) => u._id.toString() === app.assignedOfficer?.toString());
  return {
    ...app,
    user: userObj || app.user,
    course: courseObj || app.course,
    student: studentObj || app.student,
    payment: paymentObj || null,
    assignedOfficer: officerObj || null,
  };
};

exports.createApplication = async (appData) => {
  if (isMongoConnected()) {
    return await Application.create(appData);
  }
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const newApp = {
    _id: `app-iem-${Date.now()}`,
    applicationNumber: `IEM-${new Date().getFullYear()}-${randomSuffix}`,
    ...appData,
    status: appData.status || 'DRAFT',
    currentStep: appData.currentStep || 1,
    isFeePaid: false,
    timeline: [
      {
        status: 'DRAFT',
        actorName: 'Applicant',
        role: 'student',
        comment: 'Application draft created.',
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
  };
  memoryDB.applications.push(newApp);
  return newApp;
};

exports.updateApplication = async (id, updateData) => {
  if (isMongoConnected()) {
    return await Application.findByIdAndUpdate(id, updateData, { new: true });
  }
  const idx = memoryDB.applications.findIndex((a) => a._id.toString() === id.toString());
  if (idx !== -1) {
    const existing = memoryDB.applications[idx];
    const updated = { ...existing, ...updateData };
    if (updateData.timelineEntry) {
      updated.timeline = [...(existing.timeline || []), updateData.timelineEntry];
    }
    memoryDB.applications[idx] = updated;
    return updated;
  }
  return null;
};

// ==================== DOCUMENTS ====================
exports.getDocuments = async (filter = {}) => {
  if (isMongoConnected()) {
    return await Document.find(filter).sort({ createdAt: -1 });
  }
  let docs = [...memoryDB.documents];
  if (filter.user) docs = docs.filter((d) => d.user.toString() === filter.user.toString());
  if (filter.application) docs = docs.filter((d) => d.application?.toString() === filter.application.toString());
  return docs;
};

exports.createDocument = async (docData) => {
  if (isMongoConnected()) {
    return await Document.create(docData);
  }
  const existingIdx = memoryDB.documents.findIndex(
    (d) => d.user.toString() === docData.user.toString() && d.documentType === docData.documentType
  );
  if (existingIdx !== -1) {
    memoryDB.documents[existingIdx] = { ...memoryDB.documents[existingIdx], ...docData, status: 'PENDING' };
    return memoryDB.documents[existingIdx];
  }
  const newDoc = {
    _id: `doc-${Date.now()}`,
    ...docData,
    status: 'PENDING',
    createdAt: new Date(),
  };
  memoryDB.documents.push(newDoc);
  return newDoc;
};

exports.updateDocument = async (id, updateData) => {
  if (isMongoConnected()) {
    return await Document.findByIdAndUpdate(id, updateData, { new: true });
  }
  const idx = memoryDB.documents.findIndex((d) => d._id.toString() === id.toString());
  if (idx !== -1) {
    memoryDB.documents[idx] = { ...memoryDB.documents[idx], ...updateData };
    return memoryDB.documents[idx];
  }
  return null;
};

exports.deleteDocument = async (id, userId) => {
  if (isMongoConnected()) {
    return await Document.findOneAndDelete({ _id: id, user: userId });
  }
  const idx = memoryDB.documents.findIndex(
    (d) => d._id.toString() === id.toString() && d.user.toString() === userId.toString()
  );
  if (idx !== -1) {
    const deleted = memoryDB.documents.splice(idx, 1)[0];
    return deleted;
  }
  return null;
};

// ==================== PAYMENTS ====================
exports.createPayment = async (payData) => {
  if (isMongoConnected()) {
    return await Payment.create(payData);
  }
  const newPay = {
    _id: `pay-${Date.now()}`,
    orderId: `ORD-IEM-${Date.now()}`,
    receiptNumber: `RCP-IEM-${Math.floor(100000 + Math.random() * 900000)}`,
    ...payData,
    status: payData.status || 'PENDING',
    createdAt: new Date(),
  };
  memoryDB.payments.push(newPay);
  return newPay;
};

exports.getPaymentByTxnId = async (txnId) => {
  if (isMongoConnected()) {
    return await Payment.findOne({ transactionId: txnId });
  }
  return memoryDB.payments.find((p) => p.transactionId === txnId) || null;
};

exports.getPaymentByReceipt = async (receiptNumber) => {
  if (isMongoConnected()) {
    return await Payment.findOne({ receiptNumber })
      .populate('user', 'name email phone')
      .populate({ path: 'application', populate: { path: 'course' } });
  }
  const payment = memoryDB.payments.find((p) => p.receiptNumber === receiptNumber);
  if (!payment) return null;
  const user = memoryDB.users.find((u) => u._id.toString() === payment.user.toString());
  const application = memoryDB.applications.find((a) => a._id.toString() === payment.application.toString());
  let course = null;
  if (application) {
    course = memoryDB.courses.find((c) => c._id.toString() === (application.course?._id || application.course).toString());
  }
  return {
    ...payment,
    user,
    application: application ? { ...application, course } : null,
  };
};

// ==================== NOTIFICATIONS ====================
exports.getNotificationsForUser = async (userId, userRole) => {
  if (isMongoConnected()) {
    return await Notification.find({
      $or: [{ recipient: userId }, { targetRole: 'all' }, { targetRole: userRole }],
    }).sort({ createdAt: -1 });
  }
  return memoryDB.notifications
    .filter(
      (n) =>
        (n.recipient && n.recipient.toString() === userId.toString()) ||
        n.targetRole === 'all' ||
        n.targetRole === userRole
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

exports.createNotification = async (notifData) => {
  if (isMongoConnected()) {
    return await Notification.create(notifData);
  }
  const newNotif = {
    _id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...notifData,
    isRead: false,
    createdAt: new Date(),
  };
  memoryDB.notifications.unshift(newNotif);
  return newNotif;
};

exports.markNotificationAsRead = async (id) => {
  if (isMongoConnected()) {
    return await Notification.findByIdAndUpdate(id, { isRead: true, readAt: new Date() }, { new: true });
  }
  const notif = memoryDB.notifications.find((n) => n._id.toString() === id.toString());
  if (notif) {
    notif.isRead = true;
    notif.readAt = new Date();
    return notif;
  }
  return null;
};

// ==================== AUDIT LOGS ====================
exports.createAuditLog = async (logData) => {
  if (isMongoConnected()) {
    return await AuditLog.create(logData);
  }
  const newLog = {
    _id: `aud-${Date.now()}`,
    ...logData,
    createdAt: new Date(),
  };
  memoryDB.auditLogs.unshift(newLog);
  return newLog;
};

exports.getAuditLogs = async (moduleFilter = null) => {
  if (isMongoConnected()) {
    const q = moduleFilter ? { module: moduleFilter } : {};
    return await AuditLog.find(q).sort({ createdAt: -1 }).limit(100);
  }
  let logs = [...memoryDB.auditLogs];
  if (moduleFilter) logs = logs.filter((l) => l.module === moduleFilter);
  return logs;
};

// ==================== ADMIN METRICS ====================
exports.getAdminDashboardMetrics = async () => {
  if (isMongoConnected()) {
    const totalApplications = await Application.countDocuments();
    const approvedApplications = await Application.countDocuments({ status: { $in: ['APPROVED', 'ADMITTED'] } });
    const rejectedApplications = await Application.countDocuments({ status: 'REJECTED' });
    const pendingApplications = await Application.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] } });
    const draftApplications = await Application.countDocuments({ status: 'DRAFT' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOfficers = await User.countDocuments({ role: 'officer' });
    const totalCourses = await Course.countDocuments({ isActive: true });

    return {
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      draftApplications,
      totalStudents,
      totalOfficers,
      totalCourses,
      totalRevenue: totalApplications * 2000,
    };
  }

  const apps = memoryDB.applications;
  return {
    totalApplications: apps.length,
    approvedApplications: apps.filter((a) => a.status === 'APPROVED' || a.status === 'ADMITTED').length,
    rejectedApplications: apps.filter((a) => a.status === 'REJECTED').length,
    pendingApplications: apps.filter((a) => ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(a.status)).length,
    draftApplications: apps.filter((a) => a.status === 'DRAFT').length,
    totalStudents: memoryDB.users.filter((u) => u.role === 'student').length,
    totalOfficers: memoryDB.users.filter((u) => u.role === 'officer').length,
    totalCourses: memoryDB.courses.filter((c) => c.isActive).length,
    totalRevenue: apps.filter((a) => a.isFeePaid).length * 2000,
  };
};

module.exports = exports;
