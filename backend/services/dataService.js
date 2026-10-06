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
const Ticket = require('../models/Ticket');
const ContactInquiry = require('../models/ContactInquiry');

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

// ==================== ADMIN METRICS & REVENUE ====================
exports.getAdminDashboardMetrics = async () => {
  const apps = isMongoConnected() ? await Application.find().populate('course') : memoryDB.applications;
  const courses = isMongoConnected() ? await Course.find() : memoryDB.courses;
  const users = isMongoConnected() ? await User.find() : memoryDB.users;
  const payments = isMongoConnected() ? await Payment.find() : memoryDB.payments;

  const totalApplications = apps.length;
  const approvedApplications = apps.filter((a) => ['APPROVED', 'ADMITTED', 'SEAT_ALLOCATED'].includes(a.status)).length;
  const rejectedApplications = apps.filter((a) => a.status === 'REJECTED').length;
  const pendingApplications = apps.filter((a) => ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'].includes(a.status)).length;
  const draftApplications = apps.filter((a) => a.status === 'DRAFT').length;

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalOfficers = users.filter((u) => ['officer', 'admission_officer'].includes(u.role)).length;
  const totalFaculty = users.filter((u) => u.role === 'faculty').length;
  const totalCourses = courses.filter((c) => c.isActive).length;

  const totalSeats = courses.reduce((acc, c) => acc + (c.totalSeats || 0), 0);
  const availableSeats = courses.reduce((acc, c) => acc + (c.availableSeats || 0), 0);
  const allocatedSeats = totalSeats - availableSeats;

  // Department Statistics
  const deptMap = {};
  courses.forEach((c) => {
    const dept = c.department || 'Other';
    if (!deptMap[dept]) {
      deptMap[dept] = { department: dept, totalSeats: 0, availableSeats: 0, applicationCount: 0, approvedCount: 0 };
    }
    deptMap[dept].totalSeats += c.totalSeats || 0;
    deptMap[dept].availableSeats += c.availableSeats || 0;
  });

  apps.forEach((a) => {
    const courseObj = courses.find((c) => c._id?.toString() === (a.course?._id || a.course)?.toString());
    if (courseObj && courseObj.department) {
      const dept = courseObj.department;
      if (deptMap[dept]) {
        deptMap[dept].applicationCount++;
        if (['APPROVED', 'ADMITTED'].includes(a.status)) deptMap[dept].approvedCount++;
      }
    }
  });

  // Revenue Analytics
  const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
  const totalRevenue = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingRevenue = (totalApplications - successfulPayments.length) * 2000;

  const paymentMethodBreakdown = {
    UPI: successfulPayments.filter((p) => p.paymentMethod === 'UPI').length,
    CREDIT_CARD: successfulPayments.filter((p) => p.paymentMethod === 'CREDIT_CARD').length,
    DEBIT_CARD: successfulPayments.filter((p) => p.paymentMethod === 'DEBIT_CARD').length,
    NET_BANKING: successfulPayments.filter((p) => p.paymentMethod === 'NET_BANKING').length,
    RAZORPAY: successfulPayments.filter((p) => p.paymentMethod === 'RAZORPAY').length,
  };

  return {
    totalApplications,
    approvedApplications,
    rejectedApplications,
    pendingApplications,
    draftApplications,
    totalStudents,
    totalOfficers,
    totalFaculty,
    totalCourses,
    totalSeats,
    availableSeats,
    allocatedSeats,
    totalRevenue,
    pendingRevenue,
    successfulTransactions: successfulPayments.length,
    departmentStats: Object.values(deptMap),
    paymentMethodBreakdown,
  };
};

// ==================== HELPDESK & SUPPORT TICKETS ====================
exports.createTicket = async (ticketData) => {
  const ticketNumber = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  if (isMongoConnected()) {
    const ticket = new Ticket({ ...ticketData, ticketNumber });
    return await ticket.save();
  }
  const newTicket = {
    _id: `tkt-${Date.now()}`,
    ticketNumber,
    ...ticketData,
    status: 'OPEN',
    responses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryDB.supportTickets.unshift(newTicket);
  return newTicket;
};

exports.getTickets = async (filter = {}) => {
  if (isMongoConnected()) {
    return await Ticket.find(filter).sort({ createdAt: -1 });
  }
  let list = [...memoryDB.supportTickets];
  if (filter.user) {
    list = list.filter((t) => (t.user?._id || t.user)?.toString() === filter.user.toString());
  }
  if (filter.status) {
    list = list.filter((t) => t.status === filter.status);
  }
  return list;
};

exports.getTicketById = async (id) => {
  if (isMongoConnected()) {
    return await Ticket.findById(id);
  }
  return memoryDB.supportTickets.find((t) => t._id?.toString() === id?.toString()) || null;
};

exports.updateTicket = async (id, updateData) => {
  if (isMongoConnected()) {
    return await Ticket.findByIdAndUpdate(id, updateData, { new: true });
  }
  const idx = memoryDB.supportTickets.findIndex((t) => t._id?.toString() === id?.toString());
  if (idx !== -1) {
    memoryDB.supportTickets[idx] = { ...memoryDB.supportTickets[idx], ...updateData, updatedAt: new Date() };
    return memoryDB.supportTickets[idx];
  }
  return null;
};

// ==================== CONTACT INQUIRIES ====================
exports.createContactInquiry = async (data) => {
  if (isMongoConnected()) {
    const inq = new ContactInquiry(data);
    return await inq.save();
  }
  const newInq = {
    _id: `inq-${Date.now()}`,
    ...data,
    status: 'NEW',
    createdAt: new Date(),
  };
  memoryDB.contactInquiries.unshift(newInq);
  return newInq;
};

exports.getContactInquiries = async () => {
  if (isMongoConnected()) {
    return await ContactInquiry.find().sort({ createdAt: -1 });
  }
  return [...memoryDB.contactInquiries];
};

exports.updateContactInquiry = async (id, data) => {
  if (isMongoConnected()) {
    return await ContactInquiry.findByIdAndUpdate(id, data, { new: true });
  }
  const idx = memoryDB.contactInquiries.findIndex((i) => i._id?.toString() === id?.toString());
  if (idx !== -1) {
    memoryDB.contactInquiries[idx] = { ...memoryDB.contactInquiries[idx], ...data };
    return memoryDB.contactInquiries[idx];
  }
  return null;
};

// ==================== PAYMENTS LIST ====================
exports.getAllPayments = async () => {
  if (isMongoConnected()) {
    return await Payment.find().sort({ createdAt: -1 }).populate('user', 'name email');
  }
  return [...memoryDB.payments].map((p) => {
    const userObj = memoryDB.users.find((u) => u._id === p.user);
    return { ...p, userName: userObj ? userObj.name : 'Candidate', userEmail: userObj ? userObj.email : '' };
  });
};

exports.getPaymentsByUserId = async (userId) => {
  if (isMongoConnected()) {
    return await Payment.find({ user: userId }).sort({ createdAt: -1 });
  }
  return memoryDB.payments.filter((p) => (p.user?._id || p.user)?.toString() === userId?.toString());
};

// ==================== ADMIN DATABASE ACCESS PANEL ====================
exports.getDatabaseCollectionsSummary = async () => {
  return [
    { name: 'users', label: 'Users & Credentials', count: memoryDB.users.length },
    { name: 'students', label: 'Student Profiles', count: memoryDB.students.length },
    { name: 'courses', label: 'Courses & Seat Matrix', count: memoryDB.courses.length },
    { name: 'applications', label: 'Admission Applications', count: memoryDB.applications.length },
    { name: 'payments', label: 'Fee Transactions', count: memoryDB.payments.length },
    { name: 'documents', label: 'Uploaded Documents', count: memoryDB.documents.length },
    { name: 'tickets', label: 'Helpdesk Tickets', count: memoryDB.supportTickets.length },
    { name: 'contacts', label: 'Contact Inquiries', count: memoryDB.contactInquiries.length },
    { name: 'auditLogs', label: 'System Audit Logs', count: memoryDB.auditLogs.length },
  ];
};

exports.getCollectionRecords = async (collectionName, search = '') => {
  const map = {
    users: memoryDB.users.map((u) => { const { password, ...safe } = u; return safe; }),
    students: memoryDB.students,
    courses: memoryDB.courses,
    applications: memoryDB.applications,
    payments: memoryDB.payments,
    documents: memoryDB.documents,
    tickets: memoryDB.supportTickets,
    contacts: memoryDB.contactInquiries,
    auditlogs: memoryDB.auditLogs,
  };

  const key = collectionName.toLowerCase();
  let records = map[key] || [];

  if (search) {
    const s = search.toLowerCase();
    records = records.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }

  return records;
};

exports.createCollectionRecord = async (collectionName, recordData) => {
  const key = collectionName.toLowerCase();
  const id = `rec-${Date.now()}`;
  const newRec = { _id: id, ...recordData, createdAt: new Date() };

  if (key === 'users') {
    if (recordData.password) recordData.password = bcrypt.hashSync(recordData.password, 10);
    memoryDB.users.push(newRec);
  } else if (key === 'courses') {
    memoryDB.courses.push(newRec);
  } else if (key === 'tickets') {
    memoryDB.supportTickets.unshift(newRec);
  } else if (key === 'contacts') {
    memoryDB.contactInquiries.unshift(newRec);
  } else if (key === 'payments') {
    memoryDB.payments.unshift(newRec);
  } else {
    if (memoryDB[key] && Array.isArray(memoryDB[key])) {
      memoryDB[key].unshift(newRec);
    }
  }

  return newRec;
};

exports.updateCollectionRecord = async (collectionName, id, updateData) => {
  const key = collectionName.toLowerCase();
  const arr = memoryDB[key] || (key === 'tickets' ? memoryDB.supportTickets : key === 'contacts' ? memoryDB.contactInquiries : null);
  if (!arr) return null;

  const idx = arr.findIndex((r) => r._id?.toString() === id.toString());
  if (idx !== -1) {
    arr[idx] = { ...arr[idx], ...updateData, updatedAt: new Date() };
    return arr[idx];
  }
  return null;
};

exports.deleteCollectionRecord = async (collectionName, id) => {
  const key = collectionName.toLowerCase();
  const arr = memoryDB[key] || (key === 'tickets' ? memoryDB.supportTickets : key === 'contacts' ? memoryDB.contactInquiries : null);
  if (!arr) return false;

  const idx = arr.findIndex((r) => r._id?.toString() === id.toString());
  if (idx !== -1) {
    arr.splice(idx, 1);
    return true;
  }
  return false;
};

module.exports = exports;
