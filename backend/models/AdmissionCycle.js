const mongoose = require('mongoose');

const admissionCycleSchema = new mongoose.Schema(
  {
    cycleCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '2026-2027',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    applicationFee: {
      type: Number,
      default: 2000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    announcement: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AdmissionCycle', admissionCycleSchema);
