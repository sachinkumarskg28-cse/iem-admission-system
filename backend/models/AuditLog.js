const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userEmail: {
      type: String,
      default: 'Anonymous',
    },
    role: {
      type: String,
      default: 'guest',
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      enum: ['AUTH', 'STUDENT', 'APPLICATION', 'DOCUMENT', 'COURSE', 'PAYMENT', 'OFFICER', 'ADMIN', 'SYSTEM'],
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
