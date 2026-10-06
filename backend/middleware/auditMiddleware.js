const mongoose = require('mongoose');
const memoryDB = require('../config/inMemoryDB');
const AuditLog = require('../models/AuditLog');

const recordAudit = async (req, { action, module, details = {} }) => {
  try {
    const user = req.user || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const logEntry = {
      user: user ? user._id : null,
      userEmail: user ? user.email : 'system/guest',
      role: user ? user.role : 'guest',
      action,
      module,
      details,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create(logEntry);
    } else {
      memoryDB.auditLogs.unshift({ _id: `aud-${Date.now()}`, ...logEntry });
    }
  } catch (error) {
    console.warn('[Audit Logging Warning]:', error.message);
  }
};

module.exports = { recordAudit };
