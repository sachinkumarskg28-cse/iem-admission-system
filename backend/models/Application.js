const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    admissionCycle: {
      type: String,
      default: '2026-2027',
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'DOCUMENTS_VERIFIED',
        'PROVISIONALLY_APPROVED',
        'APPROVED',
        'REJECTED',
        'FEE_PENDING',
        'ADMITTED',
        'CANCELLED',
      ],
      default: 'DRAFT',
      index: true,
    },
    currentStep: {
      type: Number,
      default: 1, // 1: Personal, 2: Academic, 3: Course, 4: Documents, 5: Review & Fee, 6: Submitted
    },
    isFeePaid: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    submissionDate: {
      type: Date,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    officerRemarks: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    decisionDate: {
      type: Date,
    },
    admissionOfferLetterGenerated: {
      type: Boolean,
      default: false,
    },
    meritScore: {
      type: Number,
      default: 0,
    },
    timeline: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorName: { type: String },
        role: { type: String },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate applicationNumber
applicationSchema.pre('save', function (next) {
  if (!this.applicationNumber) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.applicationNumber = `IEM-${new Date().getFullYear()}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
