const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: [
        'School of Engineering & Technology',
        'Department of Computer Science & Engineering',
        'Department of Information Technology',
        'Department of Electronics & Communication',
        'Department of Electrical Engineering',
        'Department of Mechanical Engineering',
        'Department of Computer Applications',
        'School of Management',
        'Department of Basic Science & Humanities',
      ],
    },
    level: {
      type: String,
      enum: ['UG', 'PG', 'Doctoral', 'Diploma'],
      default: 'UG',
    },
    duration: {
      type: String,
      required: true,
      default: '4 Years (8 Semesters)',
    },
    eligibilityCriteria: {
      type: String,
      required: true,
    },
    minimumPCMPercentage: {
      type: Number,
      default: 60,
    },
    acceptedExams: [
      {
        type: String,
        enum: ['WBJEE', 'JEE Main', 'IEMJEE', 'GATE', 'CAT', 'MAT', 'Direct / Merit', 'Other'],
      },
    ],
    totalSeats: {
      type: Number,
      required: [true, 'Total seats count is required'],
      min: [1, 'Total seats must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
    },
    feesStructure: {
      admissionFee: { type: Number, default: 25000 },
      perSemesterTuition: { type: Number, default: 85000 },
      totalSemesters: { type: Number, default: 8 },
      cautionDeposit: { type: Number, default: 10000 },
      libraryAndLabFee: { type: Number, default: 15000 },
      totalCourseFee: { type: Number, default: 730000 },
    },
    brochureUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto compute total fee if modified
courseSchema.pre('save', function (next) {
  if (this.feesStructure) {
    const sem = this.feesStructure.totalSemesters || 8;
    const tuition = this.feesStructure.perSemesterTuition || 0;
    const adm = this.feesStructure.admissionFee || 0;
    const caution = this.feesStructure.cautionDeposit || 0;
    const lab = this.feesStructure.libraryAndLabFee || 0;
    this.feesStructure.totalCourseFee = adm + caution + lab + tuition * sem;
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
