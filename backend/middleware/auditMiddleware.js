const AuditLog = require('../models/AuditLog');

const recordAudit = async (req, { action, module, details = {} }) => {
  try {
    const user = req.user || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    await AuditLog.create({
      user: user ? user._id : null,
      userEmail: user ? user.email : 'system/guest',
      role: user ? user.role : 'guest',
      action,
      module,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('[Audit Logging Warning]:', error.message);
  }
};

module.exports = { recordAudit };
